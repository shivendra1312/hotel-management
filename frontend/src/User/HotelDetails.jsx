import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchHotel();
    fetchRooms();
    fetchReviews();
  }, [id]);

  const fetchHotel = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/hotel/public/${id}`);
      setHotel(res.data.hotel);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/room/public/hotel/${id}`);
      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/review/hotel/${id}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookRoom = (room) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "user") {
      alert("Sirf users book kar sakte hain");
      return;
    }
    navigate(`/booking/${room._id}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Hotel nahi mila
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Wapas Hotels par</Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl overflow-hidden h-80">
            <img src={hotel.images[activeImage]} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {hotel.images.slice(0, 4).map((img, i) => (
              <div key={i} onClick={() => setActiveImage(i)} className={`rounded-xl overflow-hidden h-36 cursor-pointer border-2 ${activeImage === i ? "border-blue-500" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80 transition" />
              </div>
            ))}
          </div>
        </div>

        {/* Hotel Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-gray-500 mt-1">📍 {hotel.address}, {hotel.cityId?.name}, {hotel.stateId?.name}</p>

            {hotel.averageRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span className="font-bold text-gray-900">{hotel.averageRating}</span>
                <span className="text-gray-500 text-sm">({hotel.totalReviews} reviews)</span>
              </div>
            )}

            <p className="text-gray-700 mt-4 leading-relaxed">{hotel.description}</p>

            {hotel.amenities?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((a, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Available Rooms</h3>
              {rooms.length === 0 ? (
                <p className="text-gray-500">Koi room available nahi</p>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room._id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">Room {room.roomNumber}</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{room.type}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Max {room.maxGuests} guests</p>
                        {room.description && <p className="text-sm text-gray-600 mt-1">{room.description}</p>}
                        {room.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {room.amenities.slice(0, 4).map((a, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-2xl font-bold text-gray-900">₹{room.price}<span className="text-sm font-normal text-gray-500">/night</span></p>
                        <button
                          onClick={() => handleBookRoom(room)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Book Karo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Guest Reviews</h3>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="bg-white border border-gray-100 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{r.userId?.name}</span>
                        <span className="text-yellow-400 font-bold">⭐ {r.overallRating}</span>
                      </div>
                      {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                      <div className="grid grid-cols-5 gap-2 mt-3 text-xs text-gray-500">
                        <div>Cleanliness: {r.cleanliness}/5</div>
                        <div>Service: {r.service}/5</div>
                        <div>Comfort: {r.comfort}/5</div>
                        <div>Location: {r.location}/5</div>
                        <div>Value: {r.value}/5</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>Rooms Available</span><span className="font-medium">{rooms.length}</span></div>
                <div className="flex justify-between"><span>Avg Rating</span><span className="font-medium">{hotel.averageRating || "N/A"}</span></div>
                <div className="flex justify-between"><span>Total Reviews</span><span className="font-medium">{hotel.totalReviews}</span></div>
                <div className="flex justify-between"><span>City</span><span className="font-medium">{hotel.cityId?.name}</span></div>
                <div className="flex justify-between"><span>State</span><span className="font-medium">{hotel.stateId?.name}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
