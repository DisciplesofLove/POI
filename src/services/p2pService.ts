import Libp2p from 'libp2p';
import TCP from 'libp2p-tcp';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
import Bootstrap from 'libp2p-bootstrap';
import PeerDiscovery from 'libp2p-peer-discovery';

export class P2PService {
    private static instance: P2PService;
    private libp2p: Libp2p;
    private peers: Set<string> = new Set();

    private constructor() {
        this.initLibp2p();
    }

    public static getInstance(): P2PService {
        if (!P2PService.instance) {
            P2PService.instance = new P2PService();
        }
        return P2PService.instance;
    }

    private async initLibp2p() {
        this.libp2p = await Libp2p.create({
            addresses: {
                listen: ['/ip4/0.0.0.0/tcp/0']
            },
            modules: {
                transport: [TCP],
                streamMuxer: [Mplex],
                connEncryption: [NOISE],
                peerDiscovery: [Bootstrap]
            },
            config: {
                peerDiscovery: {
                    bootstrap: {
                        list: [
                            // Add bootstrap nodes here
                            '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
                        ]
                    }
                }
            }
        });

        await this.libp2p.start();

        this.libp2p.on('peer:discovery', (peerId) => {
            this.peers.add(peerId.toString());
        });
    }

    public async broadcastMessage(message: any) {
        // Implement message broadcasting to connected peers
    }

    public async getPeers(): Promise<string[]> {
        return Array.from(this.peers);
    }

    public async connectToPeer(multiaddr: string) {
        await this.libp2p.dial(multiaddr);
    }
}