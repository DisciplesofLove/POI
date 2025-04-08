import { ethers } from 'ethers';

export async function deployModel(config) {
    try {
        // Create deployment configuration
        const deploymentConfig = {
            modelId: ethers.utils.id(Date.now().toString()),
            model: config.selectedModel,
            dataset: config.selectedDataset,
            algorithm: config.selectedAlgorithm,
            compute: config.computeConfig,
            storage: config.storageType,
            license: config.licenseType,
            owner: config.owner
        };

        // Call deployment service
        const response = await fetch('/api/deploy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deploymentConfig)
        });

        if (!response.ok) {
            throw new Error('Deployment failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error in deployModel:', error);
        throw error;
    }
}