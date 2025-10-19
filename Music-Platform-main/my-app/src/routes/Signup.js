/**
 * USER REGISTRATION PAGE
 * 
 * This component handles new user account creation and registration.
 * 
 * WHAT THIS FILE DOES:
 * - Provides registration form with user details
 * - Handles new user account creation
 * - Validates user input and form data
 * - Manages registration state and error handling
 * - Redirects users after successful registration
 * - Provides navigation to login page
 * 
 

 */

import {useState} from "react";
import {useCookies} from "react-cookie";
import {Icon} from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PasswordInput";
import {Link, useNavigate} from "react-router-dom";
import {makeUnauthenticatedPOSTRequest} from "../utils/serverHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";

const SignupComponent = () => {
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cookie, setCookie] = useCookies(["token"]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const signUp = async () => {
        if (!email || !confirmEmail || !username || !password || !firstName || !lastName) {
            setError("Please fill in all fields");
            return;
        }

        if (email !== confirmEmail) {
            setError("Email addresses do not match");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = {email, password, username, firstName, lastName};
            const response = await makeUnauthenticatedPOSTRequest(
                "/auth/register",
                data
            );

            if (response.error) {
                setError(response.error);
                return;
            }

            if (response.token) {
                const date = new Date();
                date.setDate(date.getDate() + 30);
                setCookie("token", response.token, {path: "/", expires: date});
                navigate("/home");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                background: "linear-gradient(135deg, #18181c 0%, #232526 60%, #0f1115 100%)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Animated background music notes */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="absolute animate-float-slow left-10 top-10 opacity-10" width="80" height="80" fill="none" viewBox="0 0 24 24"><path fill="#22c55e" d="M9 17V5l10-2v12"/><circle cx="7" cy="17" r="3" fill="#232526"/><circle cx="17" cy="15" r="3" fill="#232526"/></svg>
                <svg className="absolute animate-float-fast right-10 bottom-10 opacity-5" width="100" height="100" fill="none" viewBox="0 0 24 24"><path fill="#818cf8" d="M9 17V5l10-2v12"/><circle cx="7" cy="17" r="3" fill="#232526"/><circle cx="17" cy="15" r="3" fill="#232526"/></svg>
            </div>
            <div className="logo p-5 w-full flex justify-center z-10">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMusic} className="text-4xl text-green-400 drop-shadow-lg animate-spin-slow" />
                    <span className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent" style={{fontFamily: 'Segoe UI, system-ui, sans-serif'}}>Victor</span>
                </div>
            </div>
            <div className="flex-1 w-full flex items-center justify-center z-10">
                <div className="backdrop-blur-2xl bg-[#18181c]/80 border border-white/10 shadow-2xl rounded-3xl max-w-md w-full mx-4 p-10 animate-fade-in-up" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
                    <div className="font-extrabold mb-8 text-3xl text-center text-white tracking-wide" style={{letterSpacing: '0.04em'}}>Create your free account</div>
                    {error && (
                        <div className="w-full text-red-500 bg-red-500/10 p-4 rounded-lg mb-6 animate-shake">
                            {error}
                        </div>
                    )}
                    <div className="w-full space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 font-semibold">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-3 py-3 bg-[#23272f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 border border-gray-800 shadow-sm transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 font-semibold">Confirm Email Address</label>
                            <input
                                type="email"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                                placeholder="Enter your email again"
                                className="w-full px-3 py-3 bg-[#23272f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 border border-gray-800 shadow-sm transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 font-semibold">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                className="w-full px-3 py-3 bg-[#23272f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 border border-gray-800 shadow-sm transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 font-semibold">Create Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                className="w-full px-3 py-3 bg-[#23272f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 border border-gray-800 shadow-sm transition-all duration-200"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400 font-semibold">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter your first name"
                                    className="w-full px-3 py-3 bg-[#23272f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 border border-gray-800 shadow-sm transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400 font-semibold">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter your last name"
                                    className="w-full px-3 py-3 bg-[#23272f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 border border-gray-800 shadow-sm transition-all duration-200"
                                />
                            </div>
                        </div>
                        <button
                            className="w-full py-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 hover:from-green-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8 tracking-wider"
                            onClick={signUp}
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="animate-pulse">Creating Account...</span> : "Sign Up"}
                        </button>
                        <div className="w-full border-b border-gray-800 my-8"></div>
                        <div className="text-center">
                            <p className="text-gray-500 mb-6">Already have an account?</p>
                            <Link
                                to="/login"
                                className="inline-block w-full text-center py-3 border border-gray-700 text-gray-300 rounded-full font-semibold hover:border-white hover:text-white transition-all duration-200 bg-gradient-to-r hover:from-green-400 hover:to-blue-400"
                            >
                                LOG IN TO VICTOR
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* Custom styles for animation */}
            <style>{`
                .animate-float-slow { animation: float 8s ease-in-out infinite; }
                .animate-float-fast { animation: float 5s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(.39,.575,.565,1) both; }
                @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: none; } }
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
                .animate-spin-slow { animation: spin 6s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SignupComponent;