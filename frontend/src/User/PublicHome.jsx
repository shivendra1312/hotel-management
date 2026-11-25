import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api";

const PublicHome = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchHotels();
    fetchCities();
  }, []);

  const fetchHotels = async (cityId = "", searchQuery = "") => {
    setLoading(true);
    try {
      const params = {};
      if (cityId) params.cityId = cityId;
      if (searchQuery) params.search = searchQuery;
      const res = await axios.get(`${API_BASE_URL}/hotel/public/all`, { params });
      setHotels(res.data.hotels);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/city/active`);
      setCities(res.data.cities);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHotels(selectedCity, search);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">AuraStay</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hello, {user.name}</span>
                {user.role === "user" && (
                  <Link to="/my-bookings" className="text-sm text-blue-600 hover:underline">My Bookings</Link>
                )}
                <button onClick={handleLogout} className="text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
                <Link to="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero + Search */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Apna Perfect Hotel Dhundo</h2>
          <p className="text-blue-100 mb-8">Hazaron hotels mein se apni pasand ka hotel choose karo</p>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hotel naam se dhundo..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
            >
              <option value="">Sab Cities</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
              Dhundo
            </button>
          </form>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {hotels.length > 0 ? `${hotels.length} Hotels Mile` : "Hotels"}
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl">Koi hotel nahi mila</p>
            <p className="text-sm mt-2">Search criteria badlo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Link key={hotel._id} to={`/hotels/${hotel._id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={hotel.images[0] || "https://via.placeholder.com/400x300"}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {hotel.averageRating > 0 && (
                    <span className="absolute top-3 right-3 bg-white text-yellow-500 text-xs font-bold px-2 py-1 rounded-full shadow">
                      ⭐ {hotel.averageRating}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-lg">{hotel.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {hotel.cityId?.name}, {hotel.stateId?.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{hotel.description}</p>
                  {hotel.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {hotel.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{hotel.totalReviews} reviews</span>
                    <span className="text-sm font-medium text-blue-600">Details dekhein →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicHome;
