import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../api";

const Districts = () => {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    try {
      const [dRes, sRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/district/active`),
        axios.get(`${API_BASE_URL}/state/active`),
      ]);
      setDistricts(dRes.data.districts || []);
      setStates(sRes.data.states || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !stateId) return;
    setLoading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/district/create`,
        { name: name.trim(), stateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setMsg("District add ho gaya! ✅");
      fetchData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error adding district");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Districts</h1>

      <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-wrap gap-3 max-w-xl">
        <select
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="District Name"
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add District"}
        </button>
      </form>

      {msg && <p className="text-sm font-medium text-blue-600">{msg}</p>}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-xl">
        <div className="px-5 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
          Active Districts ({districts.length})
        </div>
        <ul className="divide-y divide-gray-100">
          {districts.map((d) => (
            <li key={d._id} className="px-5 py-3 text-sm text-gray-800 flex justify-between items-center">
              <div>
                <span className="font-medium">{d.name}</span>
                <span className="text-xs text-gray-400 ml-2">({d.stateId?.name || "State"})</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{d.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Districts;
