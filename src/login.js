import React, { useState } from "react";

export default function Login({ onLogin, onNavigate }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email / Phone / Username" className="p-2 border rounded w-full mb-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 border rounded w-full mb-4" />
        <div className="flex gap-2">
          <button onClick={() => onLogin(identifier.trim(), password.trim())} className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
          <button onClick={() => onNavigate("signup_volunteer")} className="bg-green-600 text-white px-4 py-2 rounded">Sign up (Volunteer)</button>
          <button onClick={() => onNavigate("signup_manager")} className="bg-purple-600 text-white px-4 py-2 rounded">Sign up (Manager)</button>
        </div>
      </div>
    </div>
  );
}
