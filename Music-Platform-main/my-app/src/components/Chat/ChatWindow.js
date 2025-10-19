/**
 * CHAT WINDOW COMPONENT
 * 
 * This component provides the main chat interface for messaging between users.
 * 
 * WHAT THIS FILE DOES:
 * - Displays the chat conversation interface
 * - Manages message sending and receiving
 * - Shows friend list and conversation selection
 * - Handles real-time message updates
 * - Provides message input and send functionality
 * - Manages chat history and scrolling
 * 
 * KEY FEATURES:
 * - Split view with friend list and chat area
 * - Real-time message display and updates
 * - Message input with send functionality
 * - Friend list with online status indicators
 * - Chat history with automatic scrolling
 * - Message timestamps and status indicators
 * 
 *
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { makeAuthenticatedGETRequest } from '../../utils/serverHelpers';
import { useSocket } from '../../contexts/socketContext';
import LoggedInContainer from '../../containers/LoggedInContainer';
import MessageBubble from './MessageBubble';
import TextInput from '../shared/TextInput';

const ChatWindow = () => {
    const { friendId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [friend, setFriend] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchChatHistory();
        markMessagesAsRead();
    }, [friendId]);

    useEffect(() => {
        if (!socket) return;

        socket.on('newMessage', (message) => {
            if (message.sender._id === friendId) {
                setMessages(prev => [...prev, message]);
                markMessagesAsRead();
            }
        });

        socket.on('userTyping', ({ userId }) => {
            if (userId === friendId) {
                setIsTyping(true);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
            }
        });

        return () => {
            socket.off('newMessage');
            socket.off('userTyping');
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [socket, friendId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatHistory = async () => {
        try {
            setIsLoading(true);
            const [messagesResponse, friendResponse] = await Promise.all([
                makeAuthenticatedGETRequest(`/chat/history/${friendId}`),
                makeAuthenticatedGETRequest(`/friends/user/${friendId}`)
            ]);

            if (messagesResponse.error) throw new Error(messagesResponse.error);
            if (friendResponse.error) throw new Error(friendResponse.error);

            setMessages(messagesResponse.data);
            setFriend(friendResponse.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await makeAuthenticatedGETRequest(`/chat/read/${friendId}`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('privateMessage', {
            receiverId: friendId,
            content: newMessage.trim()
        });

        setNewMessage('');
    };

    const handleTyping = () => {
        if (!socket) return;
        socket.emit('typing', { receiverId: friendId });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <LoggedInContainer>
                <div className="p-4">
                    <div className="animate-pulse">
                        <div className="h-16 bg-gray-800 rounded-lg mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-800 rounded-lg w-2/3"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </LoggedInContainer>
        );
    }

    if (error) {
        return (
            <LoggedInContainer>
                <div className="p-4 text-red-500 bg-red-500/10 rounded-lg">
                    {error}
                </div>
            </LoggedInContainer>
        );
    }

    return (
        <LoggedInContainer>
            <div className="flex flex-col h-full">
                {/* Chat header */}
                <div className="bg-gray-900 p-4 flex items-center space-x-4 border-b border-gray-800">
                    <img
                        src={friend?.profilePicture}
                        alt={friend?.username}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="text-white font-semibold">
                            {friend?.firstName} {friend?.lastName}
                        </h2>
                        <div className="text-sm">
                            {friend?.isOnline ? (
                                <span className="text-green-500 flex items-center">
                                    <Icon icon="mdi:circle" className="mr-1" />
                                    Online
                                </span>
                            ) : (
                                <span className="text-gray-400">Offline</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <MessageBubble
                            key={message._id}
                            message={message}
                            isSender={message.sender._id === localStorage.getItem('userId')}
                        />
                    ))}
                    {isTyping && (
                        <div className="text-gray-400 text-sm">
                            {friend?.firstName} is typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex space-x-2">
                        <TextInput
                            value={newMessage}
                            setValue={setNewMessage}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Icon icon="mdi:send" className="text-xl" />
                        </button>
                    </div>
                </form>
            </div>
        </LoggedInContainer>
    );
};

export default ChatWindow; 