import React from 'react';

export default function VideoGrid({ localStream, remoteStreams }) {
    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            {/* Local video */}
            {localStream && (
                <div className="relative">
                    <video
                        ref={video => {
                            if (video) {
                                video.srcObject = localStream;
                                video.play().catch(console.error);
                            }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg"
                    />
                    <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                        You
                    </span>
                </div>
            )}
            
            {/* Remote videos */}
            {Object.entries(remoteStreams).map(([peerId, stream]) => (
                <div key={peerId} className="relative">
                    <video
                        ref={video => {
                            if (video) {
                                video.srcObject = stream;
                                video.play().catch(console.error);
                            }
                        }}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                    />
                    <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                        Peer {peerId}
                    </span>
                </div>
            ))}
        </div>
    );
}