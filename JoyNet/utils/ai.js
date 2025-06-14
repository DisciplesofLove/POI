export async function generateAIReview(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/ai/review', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('AI review generation failed');
        }

        const result = await response.json();
        return result.review;
    } catch (error) {
        console.error('Error generating AI review:', error);
        throw error;
    }
}

export async function generateNFTImage(file, modelType) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('modelType', modelType);

        const response = await fetch('/api/ai/generate-nft', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('NFT image generation failed');
        }

        const result = await response.json();
        return result.imageUri;
    } catch (error) {
        console.error('Error generating NFT image:', error);
        throw error;
    }
}

export async function getAIRecommendation(requirements) {
    try {
        const response = await fetch('/api/ai/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requirements })
        });

        if (!response.ok) {
            throw new Error('AI recommendations failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error getting AI recommendations:', error);
        throw error;
    }
}