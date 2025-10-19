import React from 'react';
import { Icon } from '@iconify/react';

const MessageBubble = ({ message, isSender }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] break-words ${
                    isSender
                        ? 'bg-green-500 text-white rounded-l-lg rounded-tr-lg'
                        : 'bg-gray-800 text-white rounded-r-lg rounded-tl-lg'
                } px-4 py-2 relative`}
            >
                <p>{message.content}</p>
                <div className={`flex items-center space-x-1 text-xs mt-1 ${isSender ? 'text-green-100' : 'text-gray-400'}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isSender && (
                        <Icon
                            icon={message.read ? 'mdi:check-all' : 'mdi:check'}
                            className={message.read ? 'text-blue-400' : ''}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble; 