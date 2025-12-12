import React, { useEffect, useState } from "react";
import Login from "./login";
import SignupVolunteer from "./signup_vol";
import SignupManager from "./signup_man";
import VolunteerDashboard from "./vol_dash";
import ManagerDashboard from "./man_dash";
import Profile from "./profile";

export default function VolunteerApp() {
  // -------------------- Navigation & User State --------------------
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  // -------------------- Data State --------------------
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem("events")) || []);
  const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem("applications")) || []);

  // -------------------- Local Storage Synchronization --------------------
  useEffect(() => localStorage.setItem("events", JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem("applications", JSON.stringify(applications)), [applications]);

  // Bootstrap Data
  useEffect(() => {
    const managers = JSON.parse(localStorage.getItem("managers")) || [];
    if (!managers.some((m) => m.email === "manager@example.com")) {
      managers.push({ name: "Default Manager", email: "manager@example.com", password: "123456", phone: "", role: "manager" });
      localStorage.setItem("managers", JSON.stringify(managers));
    }
    const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
    if (storedEvents.length === 0) {
      const sample = [
        { id: Date.now() + 1, title: "Beach Cleanup", startDate: "2025-02-20", endDate: "2025-02-21", volunteers: 20, description: "Cleaning the shoreline." },
        { id: Date.now() + 2, title: "Food Drive", startDate: "2025-02-25", endDate: "2025-02-26", volunteers: 15, description: "Helping collect food." },
      ];
      setEvents(sample);
    }
  }, []);

  // -------------------- Global Actions --------------------
  const handleLogin = (identifier, password) => {
    const volunteers = JSON.parse(localStorage.getItem("volunteers")) || [];
    const managers = JSON.parse(localStorage.getItem("managers")) || [];

    const foundVolunteer = volunteers.find(
      (v) => (v.email === identifier || v.phone === identifier || v.name === identifier) && v.password === password
    );
    if (foundVolunteer) {
      setCurrentUser({ ...foundVolunteer, role: "volunteer" });
      setScreen("volunteer");
      return;
    }

    const foundManager = managers.find(
      (m) => (m.email === identifier || m.phone === identifier || m.name === identifier) && m.password === password
    );
    if (foundManager) {
      setCurrentUser({ ...foundManager, role: "manager" });
      setScreen("manager");
      return;
    }
    alert("No user found with those credentials");
  };

  const handleSignup = (user, role) => {
    const key = role === "volunteer" ? "volunteers" : "managers";
    const users = JSON.parse(localStorage.getItem(key)) || [];
    
    if (users.some((u) => u.email === user.email)) return alert("Email already used");
    
    users.push(user);
    localStorage.setItem(key, JSON.stringify(users));
    alert(`${role} created. Please log in.`);
    setScreen("login");
  };

  const handleCreateEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const handleApply = (eventObj) => {
    const exists = applications.find((a) => a.eventId === eventObj.id && a.applicant === currentUser.email);
    if (exists && exists.status === "pending") return alert("You already have a pending application");
    
    const filtered = applications.filter((a) => !(a.eventId === eventObj.id && a.applicant === currentUser.email));
    setApplications([...filtered, { eventId: eventObj.id, title: eventObj.title, status: "pending", volunteerType: currentUser.type, applicant: currentUser.email }]);
    alert("Applied — waiting for approval");
  };

  const handleUpdateStatus = (eventId, applicant, status) => {
    setApplications(applications.map((a) => (a.eventId === eventId && a.applicant === applicant ? { ...a, status } : a)));
  };

  const logout = () => {
    setCurrentUser(null);
    setScreen("login");
  };

  // -------------------- Routing --------------------
  if (screen === "login") return <Login onLogin={handleLogin} onNavigate={setScreen} />;
  if (screen === "signup_volunteer") return <SignupVolunteer onSignup={handleSignup} onNavigate={setScreen} />;
  if (screen === "signup_manager") return <SignupManager onSignup={handleSignup} onNavigate={setScreen} />;
  if (screen === "profile") return <Profile currentUser={currentUser} onNavigate={setScreen} />;
  
  if (screen === "volunteer") {
    return (
      <VolunteerDashboard 
        currentUser={currentUser} 
        events={events} 
        applications={applications} 
        onApply={handleApply} 
        onLogout={logout} 
        onNavigate={setScreen} 
      />
    );
  }

  if (screen === "manager") {
    return (
      <ManagerDashboard 
        currentUser={currentUser} 
        events={events} 
        applications={applications} 
        onCreateEvent={handleCreateEvent} 
        onUpdateStatus={handleUpdateStatus} 
        onLogout={logout} 
        onNavigate={setScreen} 
      />
    );
  }

  return null;
}
