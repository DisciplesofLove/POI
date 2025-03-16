function ListModelPage() {
    const [loading, setLoading] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState(null);
    const [previewVideo, setPreviewVideo] = React.useState(null);
    const { success, error: showError } = useNotification();
    const [walletConnected, setWalletConnected] = React.useState(false);
    const [account, setAccount] = React.useState(null);
    const [modelData, setModelData] = React.useState({
        name: '',
        description: '',
        shortDescription: '',
        category: 'text-generation',
        price: '',
        leasePrice: '',
        leaseDuration: '30',
        leaseTerms: '',
        type: 'sale',
        features: [],
        requirements: [],
        useCases: [],
        version: '1.0.0',
        apiAccess: true,
        architecture: '',
        parameters: '',
        languages: [],
        frameworks: [],
        dataset: '',
        license: 'standard',
        files: [],
        tags: [],
        demoUrl: '',
        demoInstructions: '',
        videoUrl: '',
        termsOfService: '',
        privacyPolicy: '',
        supportEmail: '',
        documentation: '',
        reviews: [],
        rating: 0,
        purpose: '',
        targetAudience: [],
        performanceMetrics: {
            accuracy: '',
            speed: '',
            efficiency: ''
        },
        customization: {
            allowFinetuning: false,
            allowRetraining: false,
            customizationNotes: ''
        }
    });

    React.useEffect(() => {
        checkWalletConnection();
    }, []);

    async function checkWalletConnection() {
        try {
            if (window.localStorage.getItem('walletConnected') === 'true') {
                const connection = await connectWallet();
                if (connection && connection.account) {
                    setWalletConnected(true);
                    setAccount(connection.account);
                }
            }
        } catch (error) {
            console.error('Failed to check wallet connection:', error);
            reportError(error);
        }
    }

    async function handleConnectWallet() {
        try {
            setLoading(true);
            const connection = await connectWallet();
            if (connection && connection.account) {
                setWalletConnected(true);
                setAccount(connection.account);
                window.localStorage.setItem('walletConnected', 'true');
                success('Wallet connected successfully');
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            reportError(error);
            showError('Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setModelData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setModelData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }

    function handleArrayInput(e, field) {
        const value = e.target.value;
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setModelData(prev => ({
            ...prev,
            [field]: array
        }));
    }

    function handlePerformanceMetricChange(metric, value) {
        setModelData(prev => ({
            ...prev,
            performanceMetrics: {
                ...prev.performanceMetrics,
                [metric]: value
            }
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);

            if (!walletConnected) {
                throw new Error('Please connect your wallet first');
            }

            // Validate required fields
            const requiredFields = ['name', 'description', 'category', 'price'];
            for (const field of requiredFields) {
                if (!modelData[field]) {
                    throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                }
            }

            // In a real app, this would:
            // 1. Upload files to IPFS or similar
            // 2. Create NFT metadata
            // 3. Mint NFT
            // 4. List on marketplace
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

            success('Model listed successfully!');
            window.navigateTo('/profile');
        } catch (error) {
            console.error('Failed to list model:', error);
            reportError(error);
            showError(error.message || 'Failed to list model');
        } finally {
            setLoading(false);
        }
    }

    if (!walletConnected) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-lg mx-auto glass-effect rounded-xl p-8">
                    <div className="text-6xl text-gray-500 mb-6">
                        <i className="fas fa-wallet"></i>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Connect Wallet to List Model</h2>
                    <p className="text-gray-400 mb-8">
                        Connect your wallet to start listing your AI models on the marketplace.
                    </p>
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold w-full flex items-center justify-center"
                        onClick={handleConnectWallet}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Connecting...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <i className="fas fa-wallet mr-2"></i>
                                Connect Wallet
                            </span>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20" data-name="list-model">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">List Your AI Model</h1>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <BasicInfoForm 
                        modelData={modelData}
                        handleChange={handleChange}
                        handleArrayInput={handleArrayInput}
                    />
                    
                    <PricingForm 
                        modelData={modelData}
                        handleChange={handleChange}
                    />
                    
                    <TechnicalDetailsForm 
                        modelData={modelData}
                        handleChange={handleChange}
                        handlePerformanceMetricChange={handlePerformanceMetricChange}
                    />
                    
                    <MediaUploadForm 
                        previewImage={previewImage}
                        setPreviewImage={setPreviewImage}
                        previewVideo={previewVideo}
                        setPreviewVideo={setPreviewVideo}
                        modelData={modelData}
                        setModelData={setModelData}
                    />

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`
                                px-8 py-2 rounded-lg font-semibold
                                ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Creating...
                                </span>
                            ) : 'Create Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
