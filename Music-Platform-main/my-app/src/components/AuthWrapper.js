import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";
import { useLocation } from 'react-router-dom';
import { makeAuthenticatedGETRequest } from '../utils/serverHelpers';

const AuthWrapper = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [cookies] = useCookies(["token"]);
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await makeAuthenticatedGETRequest("/auth/current-user");
                if (response && !response.error && response._id) {
                    localStorage.setItem('userId', response._id);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        if (cookies.token) {
            fetchUserData();
        }

        // Only add delay on initial mount
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []); // Empty dependency array means this only runs once on mount

    if (isLoading) {
        return <div className="w-screen h-screen bg-gray-900"></div>;
    }

    return children;
};

export default React.memo(AuthWrapper); 