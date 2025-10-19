import {useState} from "react";
import {Icon} from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PasswordInput";
import {Link, useNavigate} from "react-router-dom";
import {makeUnauthenticatedPOSTRequest} from "../utils/serverHelpers";
import {useCookies} from "react-cookie";

const LoginComponent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cookies, setCookie] = useCookies(["token"]);
    const navigate = useNavigate();

    const login = async () => {
        const data = {email, password};
        const response = await makeUnauthenticatedPOSTRequest(
            "/auth/login",
            data
        );
        if (response && !response.err) {
            const token = response.token;
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setCookie("token", token, {path: "/", expires: date});
            alert("Success");
            navigate("/home");
        } else {
            alert("Failure");
        }
    };

    return (
        <>
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
            <div className="logo p-5 w-full flex justify-center z-10">
                <span className="text-4xl text-green-400 mr-2 animate-spin-slow">🎵</span>
                <span className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent" style={{fontFamily: 'Segoe UI, system-ui, sans-serif'}}>Victor</span>
            </div>
            <div className="flex-1 w-full flex items-center justify-center z-10">
                <div className="backdrop-blur-2xl bg-[#18181c]/80 border border-white/10 shadow-2xl rounded-3xl max-w-md w-full mx-4 p-10 animate-fade-in-up" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
                    <div className="font-extrabold mb-8 text-3xl text-center text-white tracking-wide" style={{letterSpacing: '0.04em'}}>Welcome Back</div>
                    <div className="w-full space-y-6">
                        <TextInput
                            label="Email address or username"
                            placeholder="Email address or username"
                            className="my-6"
                            value={email}
                            setValue={setEmail}
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Password"
                            value={password}
                            setValue={setPassword}
                        />
                        <button
                            className="w-full py-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 hover:from-green-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8 tracking-wider"
                            onClick={(e) => {
                                e.preventDefault();
                                login();
                            }}
                        >
                            LOG IN
                        </button>
                        <div className="w-full border-b border-gray-800 my-8"></div>
                        <div className="text-center">
                            <p className="text-gray-500 mb-6">Don't have an account?</p>
                            <div className="inline-block w-full text-center py-3 border border-gray-700 text-gray-300 rounded-full font-semibold hover:border-white hover:text-white transition-all duration-200 bg-gradient-to-r hover:from-green-400 hover:to-blue-400">
                                <Link to="/signup">SIGN UP FOR VICTOR</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>{`
            .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(.39,.575,.565,1) both; }
            @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: none; } }
            .animate-spin-slow { animation: spin 6s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
        </>
    );
};

export default LoginComponent;