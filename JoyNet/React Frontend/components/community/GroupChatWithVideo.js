import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import VideoGrid from './VideoGrid';
import VideoCallControls from './VideoCallControls';
import { sendIceCandidate, reconnectPeer, getIceServers } from '../../utils/webrtc-helpers';
import { useNotification } from '../../hooks/useNotification';

export default function GroupChatWithVideo({ group, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useNotification();

    const peerConnections = useRef({});
    const dataChannels = useRef({});
    const mediaStream = useRef(null);
    const socket = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        socket.current = io({
            query: { peerId: currentUser.id }
        });

        socket.current.emit('join-group', group.id);

        // Socket event handlers for WebRTC signaling
        socket.current.on('offer', handleIncomingOffer);
        socket.current.on('answer', handleIncomingAnswer);
        socket.current.on('ice-candidate', handleIncomingIceCandidate);

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [currentUser.id, group.id]);

    const handleIncomingOffer = async ({ offer, fromPeerId }) => {
        const pc = peerConnections.current[fromPeerId];
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                await fetch('/api/signaling/answer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        answer,
                        peerId: fromPeerId,
                        groupId: group.id
                    })
                });
            } catch (error) {
                console.error('Error handling offer:', error);
                showError('Failed to process incoming call');
            }
        }
    };

    const handleIncomingAnswer = async ({ answer, fromPeerId }) => {
        const pc = peerConnections.current[fromPeerId];
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                console.error('Error handling answer:', error);
                showError('Failed to establish connection');
            }
        }
    };

    const handleIncomingIceCandidate = async ({ candidate, fromPeerId }) => {
        const pc = peerConnections.current[fromPeerId];
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    };

    // Rest of your existing code with updated references to use refs...

    return (
        <div className="flex flex-col h-full">
            {isVideoCallActive && (
                <>
                    <VideoGrid
                        localStream={localStream}
                        remoteStreams={remoteStreams}
                    />
                    <VideoCallControls
                        onToggleAudio={handleToggleAudio}
                        onToggleVideo={handleToggleVideo}
                        onEndCall={handleEndCall}
                        isAudioEnabled={isAudioEnabled}
                        isVideoEnabled={isVideoEnabled}
                    />
                </>
            )}
            {/* Rest of your chat UI */}
        </div>
    );
}