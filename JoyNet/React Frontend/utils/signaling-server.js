class SignalingServer {
    constructor() {
        this.connections = new Map();
        this.groups = new Map();
    }

    addConnection(peerId, socket) {
        this.connections.set(peerId, socket);
    }

    removeConnection(peerId) {
        this.connections.delete(peerId);
    }

    addToGroup(groupId, peerId) {
        if (!this.groups.has(groupId)) {
            this.groups.set(groupId, new Set());
        }
        this.groups.get(groupId).add(peerId);
    }

    async relayOffer({ offer, peerId, groupId }) {
        const targetSocket = this.connections.get(peerId);
        if (targetSocket) {
            targetSocket.emit('offer', { offer, fromPeerId: peerId, groupId });
        }
    }

    async relayAnswer({ answer, peerId, groupId }) {
        const targetSocket = this.connections.get(peerId);
        if (targetSocket) {
            targetSocket.emit('answer', { answer, fromPeerId: peerId, groupId });
        }
    }

    async relayIceCandidate({ candidate, peerId, groupId }) {
        const targetSocket = this.connections.get(peerId);
        if (targetSocket) {
            targetSocket.emit('ice-candidate', { candidate, fromPeerId: peerId, groupId });
        }
    }
}

let signalingServer;

export function getSignalingServer() {
    if (!signalingServer) {
        signalingServer = new SignalingServer();
    }
    return signalingServer;
}

export function initializeSignalingServer(io) {
    const server = getSignalingServer();

    io.on('connection', (socket) => {
        const peerId = socket.handshake.query.peerId;
        
        server.addConnection(peerId, socket);

        socket.on('join-group', (groupId) => {
            socket.join(groupId);
            server.addToGroup(groupId, peerId);
        });

        socket.on('disconnect', () => {
            server.removeConnection(peerId);
        });
    });

    return server;
}