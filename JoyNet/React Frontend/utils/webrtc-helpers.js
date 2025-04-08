export async function sendIceCandidate(candidate, peerId, groupId) {
    try {
        await fetch('/api/signaling/ice-candidate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                candidate,
                peerId,
                groupId
            }),
        });
    } catch (error) {
        console.error('Failed to send ICE candidate:', error);
        throw error;
    }
}

export async function reconnectPeer(peerId, groupId) {
    try {
        // Notify the signaling server about reconnection attempt
        await fetch('/api/signaling/reconnect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                peerId,
                groupId
            }),
        });
    } catch (error) {
        console.error('Failed to initiate reconnection:', error);
        throw error;
    }
}

export function getIceServers() {
    return fetch('/api/webrtc-config')
        .then(response => response.json())
        .then(config => ({
            iceServers: [
                ...config.stun_servers,
                ...config.turn_servers
            ],
            iceTransportPolicy: config.ice_transport_policy,
            bundlePolicy: config.bundle_policy,
            rtcpMuxPolicy: config.rtcp_mux_policy,
            iceCandidatePoolSize: config.ice_candidate_pool_size
        }));
}