import { useState, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, CircularProgress } from '@mui/material';
import MarketplaceContract from '../utils/contracts/marketplace';
import { createListing } from '../utils/supabase/listings';
import { uploadToIPFS, uploadToArweave, uploadToFilecoin } from '../utils/storage';
import { generateMerkleRoot, chunkFile } from '../utils/merkle';
import { generateAIReview, generateNFTImage } from '../utils/ai';

const LICENSE_TYPES = {
    SINGLE_USE: 'SingleUse',
    MULTI_USE: 'MultiUse',
    LEASE: 'Lease',
    PERPETUAL: 'Perpetual'
};

const STORAGE_TYPES = {
    IPFS: 'IPFS',
    ARWEAVE: 'Arweave',
    FILECOIN: 'Filecoin'
};

const MODEL_TYPES = {
    ALGORITHM: 'Algorithm',
    DATASET: 'Dataset',
    MODEL: 'Model',
    GPT: 'GPT',
    TRANSFORMER: 'Transformer',
    CNN: 'CNN',
    RAW_DATA: 'RawData'
};

export default function ModelRegistrationForm() {
    const { account, library } = useWeb3React();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [progress, setProgress] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        modelFile: null,
        nftImage: null,
        modelType: MODEL_TYPES.MODEL,
        storageType: STORAGE_TYPES.IPFS,
        licenseType: LICENSE_TYPES.SINGLE_USE,
        price: '',
        usageLimit: 0,
        leaseDuration: 0,
        metadata: ''
    });

    const [aiReview, setAIReview] = useState('');
    const [merkleRoot, setMerkleRoot] = useState('');
    const [modelHash, setModelHash] = useState('');
    const [generatedNFTImage, setGeneratedNFTImage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            modelFile: file
        }));

        if (file) {
            setLoading(true);
            try {
                // Generate AI review
                const review = await generateAIReview(file);
                setAIReview(review);

                // Generate NFT image if none provided
                if (!formData.nftImage) {
                    const nftImage = await generateNFTImage(file, formData.modelType);
                    setGeneratedNFTImage(nftImage);
                }

                // Process and chunk the file
                const chunks = await chunkFile(file);
                const root = await generateMerkleRoot(chunks);
                setMerkleRoot(root);

                // Upload chunks based on selected storage type
                let hash;
                switch (formData.storageType) {
                    case STORAGE_TYPES.IPFS:
                        hash = await uploadToIPFS(chunks);
                        break;
                    case STORAGE_TYPES.ARWEAVE:
                        hash = await uploadToArweave(chunks);
                        break;
                    case STORAGE_TYPES.FILECOIN:
                        hash = await uploadToFilecoin(chunks);
                        break;
                }
                setModelHash(hash);

                setCurrentStep(2);
                setProgress(50);
            } catch (error) {
                console.error('Error processing model:', error);
                alert('Error processing model file');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Initialize marketplace contract
            const marketplace = new MarketplaceContract(library);
            await marketplace.init(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);

            // Create unique model ID
            const modelId = ethers.utils.id(Date.now().toString() + account);

            // Upload NFT image if provided
            const nftImageHash = formData.nftImage 
                ? await uploadToIPFS(formData.nftImage)
                : generatedNFTImage;

            // Register on blockchain
            await marketplace.registerModel(
                modelId,
                formData.metadata,
                modelHash,
                aiReview,
                nftImageHash,
                Object.keys(STORAGE_TYPES).indexOf(formData.storageType),
                Object.keys(LICENSE_TYPES).indexOf(formData.licenseType),
                ethers.utils.parseEther(formData.price),
                formData.usageLimit,
                formData.leaseDuration * 86400, // Convert days to seconds
                formData.modelType,
                merkleRoot
            );

            // Create Supabase listing
            await createListing({
                id: modelId,
                name: formData.name,
                description: formData.description + '\n\nAI Review:\n' + aiReview,
                image: nftImageHash,
                modelType: formData.modelType,
                storageType: formData.storageType,
                licenseType: formData.licenseType,
                price: formData.price,
                usageLimit: formData.usageLimit,
                leaseDuration: formData.leaseDuration,
                metadata: formData.metadata,
                modelHash: modelHash,
                merkleRoot: merkleRoot,
                owner: account,
                status: 'active'
            });

            setProgress(100);
            setCurrentStep(3);
            alert('Model successfully registered!');
        } catch (error) {
            console.error('Error registering model:', error);
            alert('Error registering model');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
                Register New AI Model
            </Typography>

            {/* Step indicators */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1">
                    Step {currentStep} of 3: {
                        currentStep === 1 ? 'Upload Model' :
                        currentStep === 2 ? 'Set Terms' :
                        'Confirmation'
                    }
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
            </Box>

            {/* Step 1: Basic Info and File Upload */}
            {currentStep === 1 && (
                <>
                    <TextField
                        required
                        fullWidth
                        name="name"
                        label="Model Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        required
                        fullWidth
                        multiline
                        rows={4}
                        name="description"
                        label="Model Description"
                        value={formData.description}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Model Type</InputLabel>
                        <Select
                            name="modelType"
                            value={formData.modelType}
                            onChange={handleInputChange}
                        >
                            {Object.entries(MODEL_TYPES).map(([key, value]) => (
                                <MenuItem key={key} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Storage Type</InputLabel>
                        <Select
                            name="storageType"
                            value={formData.storageType}
                            onChange={handleInputChange}
                        >
                            {Object.entries(STORAGE_TYPES).map(([key, value]) => (
                                <MenuItem key={key} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        Upload Model File
                        <input
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>

                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                    >
                        Upload NFT Image (Optional)
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    nftImage: e.target.files[0]
                                }));
                            }}
                        />
                    </Button>
                </>
            )}

            {/* Step 2: License Terms */}
            {currentStep === 2 && (
                <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>License Type</InputLabel>
                        <Select
                            name="licenseType"
                            value={formData.licenseType}
                            onChange={handleInputChange}
                        >
                            {Object.entries(LICENSE_TYPES).map(([key, value]) => (
                                <MenuItem key={key} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        required
                        fullWidth
                        type="number"
                        name="price"
                        label="Price (in JOY tokens)"
                        value={formData.price}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />

                    {formData.licenseType === LICENSE_TYPES.MULTI_USE && (
                        <TextField
                            required
                            fullWidth
                            type="number"
                            name="usageLimit"
                            label="Usage Limit"
                            value={formData.usageLimit}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                    )}

                    {formData.licenseType === LICENSE_TYPES.LEASE && (
                        <TextField
                            required
                            fullWidth
                            type="number"
                            name="leaseDuration"
                            label="Lease Duration (days)"
                            value={formData.leaseDuration}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                    )}

                    {/* AI Review Display */}
                    {aiReview && (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="AI Review"
                            value={aiReview}
                            InputProps={{
                                readOnly: true,
                            }}
                            sx={{ mb: 2 }}
                        />
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Register Model'}
                    </Button>
                </>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
                <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                    Model successfully registered and listed on the marketplace!
                </Typography>
            )}
        </Box>
    );
}