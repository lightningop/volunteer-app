import React, { useState } from "react";

export default function ManagerDashboard({ events, applications, onCreateEvent, onUpdateStatus, onLogout, onNavigate }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Local state for event creation form
  const [form, setForm] = useState({ title: "", start: "", end: "", vol: "", desc: "" });
  
  // State for Search and Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleCreate = () => {
    if (!form.title || !form.start || !form.end || !form.vol || !form.desc) return alert("Fill all fields");
    onCreateEvent({
      id: Date.now(),
      title: form.title,
      startDate: form.start,
      endDate: form.end,
      volunteers: Number(form.vol),
      description: form.desc,
    });
    setForm({ title: "", start: "", end: "", vol: "", desc: "" });
    setShowModal(false);
  };

  // Logic to filter events based on Search and Filter state
  const filteredEvents = events.filter((event) => {
    // Search Logic: Case-insensitive match on title or description
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter Logic: Example filtering by volunteer needs
    let matchesFilter = true;
    if (filterType === "high-need") {
      matchesFilter = event.volunteers > 5;
    } else if (filterType === "low-need") {
      matchesFilter = event.volunteers <= 5;
    }

    return matchesSearch && matchesFilter;
  });

  // NEW LOGIC: Filter applications to only show those that require action (pending)
  // or those that have already been accepted, but NOT rejected.
  const actionableApplications = applications.filter(a => a.status !== "rejected");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <div className="relative flex gap-2">
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Create Event</button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="bg-gray-200 px-3 py-1 rounded">Settings</button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow w-32 z-10">
              <button onClick={() => { onNavigate("profile"); setSettingsOpen(false); }} className="block w-full text-left px-2 py-1 hover:bg-gray-100">Profile</button>
              <button onClick={onLogout} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-500">Logout</button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Event</h2>
            <input className="p-2 border w-full mb-2 rounded" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <input type="date" className="p-2 border w-full mb-2 rounded" value={form.start} onChange={e => setForm({...form, start: e.target.value})} />
            <input type="date" className="p-2 border w-full mb-2 rounded" value={form.end} onChange={e => setForm({...form, end: e.target.value})} />
            <input type="number" className="p-2 border w-full mb-2 rounded" placeholder="Volunteers Needed" value={form.vol} onChange={e => setForm({...form, vol: e.target.value})} />
            <textarea className="p-2 border w-full mb-2 rounded" placeholder="Description" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Create</button>
              <button onClick={() => setShowModal(false)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-2">Created Events</h2>
      
      {/* Search and Filter UI Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search your events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Events</option>
            <option value="high-need">High Need (5+ Vols)</option>
            <option value="low-need">Low Need (≤5 Vols)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 italic py-4 text-center">No events found matching your criteria.</p>
        ) : (
          filteredEvents.map((e) => (
            <div key={e.id} className="border p-3 rounded bg-gray-50">
              <p className="font-bold">{e.title}</p>
              <p className="text-sm">Start: {e.startDate} • Volunteers: {e.volunteers}</p>
            </div>
          ))
        )}
      </div>

      <h2 className="font-semibold mb-2">All Applications</h2>
      <div className="flex flex-col gap-3">
        {actionableApplications.length === 0 && <p className="text-gray-500">No applications pending or accepted.</p>}
        {actionableApplications.map((a, idx) => (
          <div key={idx} className="border p-3 rounded bg-white">
            <p className="font-bold">{a.title}</p>
            <p>Applicant: {a.applicant} ({a.volunteerType})</p>
            <p>Status: {a.status}</p>
            <div className="mt-2 flex gap-2">
              {/* Note: When onUpdateStatus is called with 'rejected', the list will re-render without that application */}
              <button 
                onClick={() => onUpdateStatus(a.eventId, a.applicant, "accepted")} 
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                Accept
              </button>
              <button 
                onClick={() => onUpdateStatus(a.eventId, a.applicant, "rejected")} 
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
