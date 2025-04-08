import React, { useState } from 'react';

export default function VideoCallControls({ 
    onToggleAudio, 
    onToggleVideo,
    onEndCall,
    isAudioEnabled,
    isVideoEnabled 
}) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-75 p-4">
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onToggleAudio}
                    className={`p-2 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {isAudioEnabled ? 'Mute' : 'Unmute'}
                </button>
                <button
                    onClick={onToggleVideo}
                    className={`p-2 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {isVideoEnabled ? 'Stop Video' : 'Start Video'}
                </button>
                <button
                    onClick={onEndCall}
                    className="p-2 rounded-full bg-red-600"
                >
                    End Call
                </button>
            </div>
        </div>
    );
}