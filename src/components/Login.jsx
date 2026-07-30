import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSendOtpMutation, useVerifyOtpMutation } from "../features/ApplicationApi";

const Login = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
    const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

    const handleSendOtp = async () => {
        try {
            await sendOtp({ email }).unwrap();
            setStep(2);
            alert("OTP sent successfully");
        } catch (error) {
            alert("Failed to send OTP");
        }
    };

    const navigate = useNavigate();

    const handleVerifyOtp = async () => {
        try {
            const res = await verifyOtp({ email, otp }).unwrap();
            localStorage.setItem("token", res.token?.replace(/"/g, ""));
            localStorage.setItem("email", email);
            navigate("/");
        } catch (error) {
            alert("Invalid OTP");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Email Login
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Login using OTP verification
                    </p>
                </div>

                {step === 1 ? (
                    <>
                        <label className="block mb-2 text-sm font-medium">
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            onClick={handleSendOtp}
                            disabled={isSending}
                            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                        >
                            {isSending
                                ? "Sending..."
                                : "Send OTP"}
                        </button>
                    </>
                ) : (
                    <>
                        <label className="block mb-2 text-sm font-medium">
                            Enter OTP
                        </label>

                        <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />

                        <button
                            onClick={handleVerifyOtp}
                            disabled={isVerifying}
                            className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
                        >
                            {isVerifying
                                ? "Verifying..."
                                : "Verify OTP"}
                        </button>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full mt-3 text-blue-600"
                        >
                            Back to Email
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
export default Login;
