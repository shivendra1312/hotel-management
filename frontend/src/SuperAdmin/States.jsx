import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../api";

const States = () => {
  const [states, setStates] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/state/active`);
      setStates(res.data.states || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/state/create`,
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setMsg("State successfully add ho gaya! ✅");
      fetchStates();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error adding state");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage States</h1>

      <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-gray-200 flex gap-3 max-w-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New State Name (e.g. Maharashtra)"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add State"}
        </button>
      </form>

      {msg && <p className="text-sm font-medium text-blue-600">{msg}</p>}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-xl">
        <div className="px-5 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
          Active States ({states.length})
        </div>
        <ul className="divide-y divide-gray-100">
          {states.map((s) => (
            <li key={s._id} className="px-5 py-3 text-sm text-gray-800 flex justify-between items-center">
              <span>{s.name}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s.status}</span>
            </li>
          ))}
          {states.length === 0 && (
            <li className="px-5 py-6 text-sm text-gray-400 text-center">No states found. Add one above.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default States;
