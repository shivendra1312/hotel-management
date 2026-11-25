import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../api";

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [name, setName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/city/active`),
        axios.get(`${API_BASE_URL}/district/active`),
      ]);
      setCities(cRes.data.cities || []);
      setDistricts(dRes.data.districts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !districtId) return;
    setLoading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      const chosenDistrict = districts.find((d) => d._id === districtId);
      const stateId = chosenDistrict?.stateId?._id || chosenDistrict?.stateId;

      await axios.post(
        `${API_BASE_URL}/city/create`,
        { name: name.trim(), districtId, stateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setMsg("City add ho gayi! ✅");
      fetchData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error adding city");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Cities</h1>

      <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-wrap gap-3 max-w-xl">
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="City Name"
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add City"}
        </button>
      </form>

      {msg && <p className="text-sm font-medium text-blue-600">{msg}</p>}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-xl">
        <div className="px-5 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
          Active Cities ({cities.length})
        </div>
        <ul className="divide-y divide-gray-100">
          {cities.map((c) => (
            <li key={c._id} className="px-5 py-3 text-sm text-gray-800 flex justify-between items-center">
              <div>
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-gray-400 ml-2">({c.districtId?.name || "District"})</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{c.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Cities;
