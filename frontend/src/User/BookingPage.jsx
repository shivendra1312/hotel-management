import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api";

const BookingPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: 1, couponCode: "", specialRequests: "" });
  const [couponResult, setCouponResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalNights, setTotalNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (form.checkIn && form.checkOut && room) {
      const nights = Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)));
      setTotalNights(nights);
      setTotalAmount(nights * room.price);
      setCouponResult(null);
    }
  }, [form.checkIn, form.checkOut, room]);

  const fetchRoom = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/room/${roomId}`);
      setRoom(res.data.room);
    } catch (err) {
      setError("Room nahi mila");
    }
  };

  const validateCoupon = async () => {
    if (!form.couponCode) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/coupon/validate`, {
        code: form.couponCode,
        totalAmount,
      });
      setCouponResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid coupon");
      setCouponResult(null);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");

      // Pehle room hold karo
      await axios.post(`${API_BASE_URL}/temporary/hold`, {
        roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Phir booking create karo
      const res = await axios.post(`${API_BASE_URL}/booking/create`, {
        roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests,
        couponCode: form.couponCode || undefined,
        specialRequests: form.specialRequests || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("Booking ho gayi! 🎉");
      navigate("/my-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Booking nahi hui");
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = couponResult ? couponResult.finalAmount : totalAmount;

  if (!room) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to={`/hotels/${room.hotelId._id}`} className="text-blue-600 hover:underline text-sm">← Wapas Hotel par</Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Room Book Karo</h1>

        {/* Room Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{room.hotelId?.name}</h3>
              <p className="text-sm text-gray-500">Room {room.roomNumber} • {room.type}</p>
              <p className="text-sm text-gray-500">Max {room.maxGuests} guests</p>
            </div>
            <p className="text-xl font-bold text-blue-600">₹{room.price}<span className="text-sm font-normal text-gray-500">/night</span></p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleBooking} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
              <input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} required min={new Date().toISOString().split("T")[0]} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
              <input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} required min={form.checkIn || new Date().toISOString().split("T")[0]} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <input type="number" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} min={1} max={room.maxGuests} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code (Optional)</label>
            <div className="flex gap-2">
              <input type="text" value={form.couponCode} onChange={(e) => { setForm({ ...form, couponCode: e.target.value }); setCouponResult(null); }} placeholder="SAVE10" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
              <button type="button" onClick={validateCoupon} className="bg-gray-100 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-200">Apply</button>
            </div>
            {couponResult && (
              <p className="text-green-600 text-sm mt-1">✅ Discount: ₹{couponResult.discount} off!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
            <textarea value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} rows={3} placeholder="Koi special request?" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          {/* Price Summary */}
          {totalNights > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>₹{room.price} × {totalNights} nights</span><span>₹{totalAmount}</span></div>
              {couponResult && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{couponResult.discount}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2"><span>Total</span><span>₹{finalAmount}</span></div>
            </div>
          )}

          <button type="submit" disabled={loading || totalNights === 0} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "Booking ho rahi hai..." : `₹${finalAmount} mein Book Karo`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
