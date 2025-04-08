export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { offer, peerId, groupId } = req.body;
        
        const signalingServer = getSignalingServer();
        
        // Send the offer to the peer through the signaling server
        await signalingServer.relayOffer({
            offer,
            peerId,
            groupId
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Signaling error:', error);
        res.status(500).json({ error: 'Failed to process offer' });
    }
}