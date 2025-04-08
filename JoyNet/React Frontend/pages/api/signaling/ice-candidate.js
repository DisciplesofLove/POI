export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { candidate, peerId, groupId } = req.body;
        
        const signalingServer = getSignalingServer();
        
        // Relay the ICE candidate to the peer through the signaling server
        await signalingServer.relayIceCandidate({
            candidate,
            peerId,
            groupId
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Signaling error:', error);
        res.status(500).json({ error: 'Failed to process ICE candidate' });
    }
}