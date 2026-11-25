import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../api";

const PendingAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState({});
  const [actionMsg, setActionMsg] = useState("");

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    const password = passwordInput[id] || "Admin@12345";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/admin/approve/${id}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg("Admin approve ho gaya! Password email par bheja gaya.");
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:") || "Not meeting criteria";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/admin/reject/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg("Admin request rejected.");
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  if (loading) return <div className="p-6">Loading pending admins...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pending Admin Requests</h1>
      {actionMsg && <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg">{actionMsg}</p>}

      {admins.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
          No pending admin approval requests.
        </div>
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{admin.name}</h3>
                <p className="text-sm text-gray-600">Email: {admin.email} | Phone: {admin.phone}</p>
                <p className="text-sm text-gray-500 mt-1">Business: {admin.businessName} - {admin.businessAddress}</p>
                <p className="text-xs text-gray-400 mt-1">Tracking ID: {admin.trackingId}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Set Password"
                  defaultValue="Admin@12345"
                  onChange={(e) => setPasswordInput({ ...passwordInput, [admin._id]: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleApprove(admin._id)}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(admin._id)}
                  className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingAdmins;
