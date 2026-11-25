import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  CheckedIn: "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [review, setReview] = useState({ cleanliness: 5, service: 5, comfort: 5, location: 5, value: 5, comment: "" });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/booking/myBookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Booking cancel karna chahte ho?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/booking/cancel/${id}`, { reason: "User cancelled" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Cancel nahi hua");
    }
  };

  const submitReview = async (bookingId, hotelId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/review/create`, { ...review, bookingId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Review de diya! ✅");
      setShowReviewModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Review nahi hua");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meri Bookings</h1>
          <Link to="/" className="text-blue-600 hover:underline text-sm">← Home par jao</Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <p className="text-xl text-gray-500">Koi booking nahi hui abhi</p>
            <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">Hotels Dekho</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {b.hotelId?.images?.[0] && (
                    <img src={b.hotelId.images[0]} alt="" className="w-full sm:w-40 h-32 sm:h-auto object-cover" />
                  )}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{b.hotelId?.name}</h3>
                        <p className="text-sm text-gray-500">Room {b.roomId?.roomNumber} • {b.roomId?.type}</p>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                      <div>
                        <p className="text-gray-400">Check-In</p>
                        <p className="font-medium">{new Date(b.checkIn).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Check-Out</p>
                        <p className="font-medium">{new Date(b.checkOut).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Nights</p>
                        <p className="font-medium">{b.totalNights}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-bold text-blue-600">₹{b.finalAmount}</p>
                      </div>
                    </div>

                    {b.couponCode && (
                      <p className="text-xs text-green-600 mt-2">🏷️ Coupon: {b.couponCode} (₹{b.discountAmount} off)</p>
                    )}

                    <div className="flex gap-2 mt-4">
                      {["Pending", "Confirmed"].includes(b.status) && (
                        <button onClick={() => handleCancel(b._id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Cancel</button>
                      )}
                      {b.status === "Completed" && (
                        <button onClick={() => setShowReviewModal(b)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100">Review Do</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Review Do — {showReviewModal.hotelId?.name}</h3>
            <div className="space-y-3">
              {["cleanliness", "service", "comfort", "location", "value"].map((field) => (
                <div key={field} className="flex items-center justify-between">
                  <label className="text-sm capitalize text-gray-700">{field}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReview({ ...review, [field]: star })} className={`text-xl ${review[field] >= star ? "text-yellow-400" : "text-gray-300"}`}>★</button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={3} placeholder="Apna experience batao..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowReviewModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => submitReview(showReviewModal._id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
