import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "./api";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: form, Step 2: OTP
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1: OTP bhejo
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/userSignup/sendSignupOtp`, form);
      setSuccess("OTP tumhare email par bheja gaya!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "OTP bhejne mein error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP verify karo
  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/userSignup/verifySignupOtp`, {
        email: form.email,
        otp,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verify nahi hua");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AuraStay</h1>
          <p className="text-gray-500 mt-2">
            {step === 1 ? "Naya account banao" : "Email verify karo"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
          <div className={`h-1 w-16 rounded ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Tumhara naam" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="tumhara@email.com" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? "OTP bhej raha hai..." : "OTP Bhejo"}
            </button>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-5">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-medium">{form.email}</span> par 6-digit OTP bheja gaya
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} placeholder="123456" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? "Verify ho raha hai..." : "Verify Karo"}
            </button>
            <button type="button" onClick={() => { setStep(1); setSuccess(""); setError(""); }} className="w-full text-sm text-gray-500 hover:text-gray-700">
              ← Wapas jao
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Account hai?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login karo</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
