import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// User Pages
import PublicHome from "./User/PublicHome";
import HotelDetails from "./User/HotelDetails";
import MyBookings from "./User/MyBookings";
import BookingPage from "./User/BookingPage";

// Admin Pages
import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import AddHotel from "./Admin/AddHotel";
import MyHotels from "./Admin/MyHotels";
import AddRoom from "./Admin/AddRoom";
import AllRooms from "./Admin/AllRooms";
import AdminBookings from "./Admin/AdminBookings";
import AddCoupon from "./Admin/AddCoupon";
import AllCoupons from "./Admin/AllCoupons";

// Hotel Pages
import HotelLayout from "./Hotel/HotelLayout";
import HotelDashboard from "./Hotel/HotelDashboard";
import HotelRooms from "./Hotel/HotelRooms";
import HotelBookings from "./Hotel/HotelBookings";

// SuperAdmin Pages
import SuperAdminLayout from "./SuperAdmin/SuperAdminLayout";
import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard";
import States from "./SuperAdmin/States";
import Districts from "./SuperAdmin/Districts";
import Cities from "./SuperAdmin/Cities";
import PendingAdmins from "./SuperAdmin/PendingAdmins";
import PendingHotels from "./SuperAdmin/PendingHotels";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />

        {/* ── Auth Routes (redirect if already logged in) ── */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* ── User Protected Routes ── */}
        <Route path="/booking/:roomId" element={<ProtectedRoute allowedRoles={["user"]}><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={["user"]}><MyBookings /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ProtectedRoute allowedRoles={["user", "admin", "hotel", "superAdmin"]}><ResetPassword /></ProtectedRoute>} />

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-hotel" element={<AddHotel />} />
          <Route path="my-hotels" element={<MyHotels />} />
          <Route path="add-room/:hotelId" element={<AddRoom />} />
          <Route path="rooms/:hotelId" element={<AllRooms />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="add-coupon" element={<AddCoupon />} />
          <Route path="coupons" element={<AllCoupons />} />
        </Route>

        {/* ── Hotel Routes ── */}
        <Route path="/hotel" element={<ProtectedRoute allowedRoles={["hotel"]}><HotelLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<HotelDashboard />} />
          <Route path="rooms" element={<HotelRooms />} />
          <Route path="bookings" element={<HotelBookings />} />
        </Route>

        {/* ── SuperAdmin Routes ── */}
        <Route path="/superAdmin" element={<ProtectedRoute allowedRoles={["superAdmin"]}><SuperAdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="states" element={<States />} />
          <Route path="districts" element={<Districts />} />
          <Route path="cities" element={<Cities />} />
          <Route path="pending-admins" element={<PendingAdmins />} />
          <Route path="pending-hotels" element={<PendingHotels />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
