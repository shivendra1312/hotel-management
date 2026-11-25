import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "./api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post(`${API_BASE_URL}/userSignup/sendOtp`, { email });
      setSuccess("OTP bheja gaya!"); setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post(`${API_BASE_URL}/userSignup/verifyOtp`, { email, otp });
      setSuccess("OTP verify ho gaya!"); setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Galat OTP");
    } finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.patch(`${API_BASE_URL}/userSignup/forgotPassword`, { email, newPassword });
      setSuccess("Password reset ho gaya!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Password Reset</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 1 && "Email daalo OTP bhejne ke liye"}
            {step === 2 && "OTP verify karo"}
            {step === 3 && "Naya password set karo"}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-5">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tumhara@email.com" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? "Bhej raha hai..." : "OTP Bhejo"}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-5">
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} placeholder="6-digit OTP" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? "Verify ho raha hai..." : "Verify Karo"}</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} className="space-y-5">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Naya password" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? "Reset ho raha hai..." : "Password Reset Karo"}</button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline">← Login par wapas jao</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
