export interface LovableAPI {
  syncDigitalTwin: (data: DigitalTwinData) => Promise<any>;
  updateReputation: (address: string, score: number) => Promise<any>;
}

export interface DigitalTwinData {
  userAddress: string;
  reputation: number;
  loveScore: number;
  viceScore: number;
  agentCount?: number;
  proposalCount?: number;
}

export class LovableConnector {
  private apiKey: string;
  private baseUrl: string = 'https://api.lovable.dev';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async syncDigitalTwin(data: DigitalTwinData): Promise<any> {
    return fetch(`${this.baseUrl}/digital-twin/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json());
  }

  async updateReputation(address: string, score: number): Promise<any> {
    return fetch(`${this.baseUrl}/reputation/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address, score })
    }).then(res => res.json());
  }
}