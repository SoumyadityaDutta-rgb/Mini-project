/**
 * SERVER API HELPER FUNCTIONS
 * 
 * This file provides utility functions for making authenticated API calls to the backend.
 * 
 * WHAT THIS FILE DOES:
 * - Provides functions for making HTTP requests to the backend API
 * - Handles authentication token management
 * - Manages request headers and cookies
 * - Provides error handling for API calls
 * - Handles different HTTP methods (GET, POST, PUT, DELETE)
 * - Manages request/response formatting
 * 

 */

import { getCookie, removeCookie } from "./cookie";

const backendUrl = "http://localhost:8000";

// Function to get token from cookies
const getToken = () => {
    return getCookie("token");
};

// Function to clear token
const clearToken = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const makeUnauthenticatedPOSTRequest = async (route, body) => {
    try {
        const response = await fetch(backendUrl + route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const formattedResponse = await response.json();
        return formattedResponse;
    } catch (error) {
        console.error("API Error:", error);
        return { error: error.message || "Something went wrong" };
    }
};

export const makeAuthenticatedPOSTRequest = async (route, body) => {
    const token = getToken();
    if (!token) {
        return { error: "No authentication token found" };
    }

    try {
        const response = await fetch(backendUrl + route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            if (response.status === 401) {
                removeCookie("token");
                window.location.assign('/login');
                return { error: "Session expired. Please login again." };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const formattedResponse = await response.json();
        return formattedResponse;
    } catch (error) {
        console.error("API Error:", error);
        return { error: error.message || "Something went wrong" };
    }
};

export const makeAuthenticatedGETRequest = async (route) => {
    const token = getToken();
    if (!token) {
        return { error: "No authentication token found" };
    }

    try {
        const response = await fetch(backendUrl + route, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                removeCookie("token");
                window.location.assign('/login');
                return { error: "Session expired. Please login again." };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const formattedResponse = await response.json();
        return formattedResponse;
    } catch (error) {
        console.error("API Error:", error);
        return { error: error.message || "Something went wrong" };
    }
};

export const makeAuthenticatedDELETERequest = async (route) => {
    const token = getToken();
    if (!token) {
        return { error: "No authentication token found" };
    }

    try {
        console.log("Making DELETE request to:", backendUrl + route);
        const response = await fetch(backendUrl + route, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        console.log("DELETE response status:", response.status);

        if (!response.ok) {
            if (response.status === 401) {
                removeCookie("token");
                window.location.assign('/login');
                return { error: "Session expired. Please login again." };
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const formattedResponse = await response.json();
        console.log("DELETE response data:", formattedResponse);
        return formattedResponse;
    } catch (error) {
        console.error("API Error:", error);
        return { error: error.message || "Something went wrong" };
    }
};