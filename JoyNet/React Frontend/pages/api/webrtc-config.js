import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

export default async function handler(req, res) {
    try {
        const configPath = path.resolve(process.cwd(), '../../src/config/webrtc_config.yaml');
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents);
        
        res.status(200).json(config.webrtc);
    } catch (error) {
        console.error('Error loading WebRTC config:', error);
        res.status(500).json({ error: 'Failed to load WebRTC configuration' });
    }
}