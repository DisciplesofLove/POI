export async function generateApiKey(modelId) {
    try {
        const response = await fetch('/api/keys/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ modelId })
        });

        if (!response.ok) {
            throw new Error('API key generation failed');
        }

        const result = await response.json();
        return result.apiKey;
    } catch (error) {
        console.error('Error generating API key:', error);
        throw error;
    }
}