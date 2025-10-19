/**
 * REAL-TIME SOCKET CONTEXT PROVIDER
 * 
 * This context provides real-time communication capabilities across the application.
 * 
 * WHAT THIS FILE DOES:
 * - Manages WebSocket connections for real-time features
 * - Provides real-time chat functionality
 * - Handles friend request notifications
 * - Manages user online/offline status
 * - Provides real-time music sharing and recommendations
 * - Handles live updates for social features
 * 
 
 
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useCookies } from 'react-cookie';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [cookies] = useCookies(['token']);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId || !cookies.token) {
            return;
        }

        // Initialize socket connection with auth header
        const newSocket = io('http://localhost:8000', {
            auth: {
                token: `Bearer ${cookies.token}`
            },
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: false // Prevent auto-connection before auth is set
        });

        // Debug connection events
        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setIsConnected(false);
        });

        // Connect after setting up event handlers
        newSocket.connect();
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                console.log('Cleaning up socket connection');
                newSocket.disconnect();
            }
        };
    }, [cookies.token]);

    const value = {
        socket,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}; 