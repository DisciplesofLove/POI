const { ClientBuilder } = require('@iota/client');
const crypto = require('crypto');

class IOTAProofService {
    constructor(node = 'https://chrysalis-nodes.iota.org') {
        this.client = new ClientBuilder()
            .node(node)
            .build();
    }
    
    /**
     * Submit a Proof of Use (POU) to IOTA
     */
    async submitPOU(domain, owner, timestamp) {
        const proof = {
            type: 'POU',
            domain,
            owner,
            timestamp,
            nonce: crypto.randomBytes(16).toString('hex')
        };
        
        const message = await this.client.message()
            .index('pou')
            .data(JSON.stringify(proof))
            .submit();
            
        return message.messageId;
    }
    
    /**
     * Submit a Proof of Integrity (POI) to IOTA
     */
    async submitPOI(domain, ipfsHash, version, owner, timestamp) {
        const proof = {
            type: 'POI',
            domain,
            ipfsHash,
            version,
            owner,
            timestamp,
            nonce: crypto.randomBytes(16).toString('hex')
        };
        
        const message = await this.client.message()
            .index('poi')
            .data(JSON.stringify(proof))
            .submit();
            
        return message.messageId;
    }
    
    /**
     * Submit a Proof of Inference (POInf) to IOTA
     */
    async submitPOInf(domain, modelHash, inputHash, outputHash, user, timestamp) {
        const proof = {
            type: 'POInf',
            domain,
            modelHash,
            inputHash,
            outputHash,
            user,
            timestamp,
            nonce: crypto.randomBytes(16).toString('hex')
        };
        
        const message = await this.client.message()
            .index('poinf')
            .data(JSON.stringify(proof))
            .submit();
            
        return message.messageId;
    }
    
    /**
     * Verify a proof by message ID
     */
    async verifyProof(messageId) {
        const message = await this.client.getMessage(messageId);
        if (!message || !message.payload || !message.payload.data) {
            return null;
        }
        
        try {
            return JSON.parse(message.payload.data);
        } catch (error) {
            console.error('Error parsing proof:', error);
            return null;
        }
    }
    
    /**
     * Get all proofs for a domain
     */
    async getDomainProofs(domain) {
        const pouMessages = await this.client.findMessages(['pou', domain]);
        const poiMessages = await this.client.findMessages(['poi', domain]);
        const poinfMessages = await this.client.findMessages(['poinf', domain]);
        
        const proofs = {
            pou: await Promise.all(pouMessages.map(msg => this.verifyProof(msg.messageId))),
            poi: await Promise.all(poiMessages.map(msg => this.verifyProof(msg.messageId))),
            poinf: await Promise.all(poinfMessages.map(msg => this.verifyProof(msg.messageId)))
        };
        
        return proofs;
    }
    
    /**
     * Verify domain activity (POU)
     */
    async verifyDomainActivity(domain, requiredPeriod) {
        const proofs = await this.getDomainProofs(domain);
        if (!proofs.pou || proofs.pou.length === 0) {
            return false;
        }
        
        const latestProof = proofs.pou
            .filter(p => p && p.timestamp)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
            
        if (!latestProof) {
            return false;
        }
        
        const now = Date.now();
        return (now - latestProof.timestamp) <= requiredPeriod;
    }
    
    /**
     * Verify model integrity (POI)
     */
    async verifyModelIntegrity(domain, ipfsHash) {
        const proofs = await this.getDomainProofs(domain);
        if (!proofs.poi || proofs.poi.length === 0) {
            return false;
        }
        
        const latestProof = proofs.poi
            .filter(p => p && p.ipfsHash)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
            
        return latestProof && latestProof.ipfsHash === ipfsHash;
    }
    
    /**
     * Get inference statistics (POInf)
     */
    async getInferenceStats(domain, startTime, endTime) {
        const proofs = await this.getDomainProofs(domain);
        if (!proofs.poinf) {
            return {
                total: 0,
                uniqueUsers: new Set(),
                timeRange: { start: startTime, end: endTime }
            };
        }
        
        const filteredProofs = proofs.poinf.filter(p => 
            p && p.timestamp >= startTime && p.timestamp <= endTime
        );
        
        return {
            total: filteredProofs.length,
            uniqueUsers: new Set(filteredProofs.map(p => p.user)),
            timeRange: { start: startTime, end: endTime }
        };
    }
}

module.exports = IOTAProofService;