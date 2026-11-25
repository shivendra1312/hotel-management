import { Link, Outlet, useNavigate } from "react-router-dom";

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };
  const links = [
    { to: "/superAdmin/dashboard", label: "📊 Dashboard" },
    { to: "/superAdmin/states", label: "🗺️ States" },
    { to: "/superAdmin/districts", label: "📍 Districts" },
    { to: "/superAdmin/cities", label: "🏙️ Cities" },
    { to: "/superAdmin/pending-admins", label: "👤 Admin Requests" },
    { to: "/superAdmin/pending-hotels", label: "🏨 Hotel Requests" },
  ];
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b"><h1 className="text-xl font-bold text-blue-600">AuraStay</h1><p className="text-sm text-gray-500 mt-1">Super Admin</p><p className="text-xs text-gray-400 mt-1 font-medium">{user.name}</p></div>
        <nav className="flex-1 p-4 space-y-1">{links.map((l) => <Link key={l.to} to={l.to} className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition">{l.label}</Link>)}</nav>
        <div className="p-4 border-t"><button onClick={handleLogout} className="w-full text-sm text-red-500 hover:text-red-700 py-2">Logout</button></div>
      </aside>
      <main className="flex-1 p-8 overflow-auto"><Outlet /></main>
    </div>
  );
};
export default SuperAdminLayout;
