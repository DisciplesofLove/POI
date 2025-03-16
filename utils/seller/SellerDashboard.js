function SellerDashboard() {
    const [activeSection, setActiveSection] = React.useState('overview');
    const [loading, setLoading] = React.useState(true);
    const [storeData, setStoreData] = React.useState(null);
    const [products, setProducts] = React.useState([]);
    const [sales, setSales] = React.useState([]);
    const [web3Status, setWeb3Status] = React.useState({
        connected: false,
        network: null,
        balance: '0',
        storeVerified: false
    });
    const [aiModels, setAiModels] = React.useState([]);
    const [analytics, setAnalytics] = React.useState({
        totalRevenue: 0,
        totalSales: 0,
        averageRating: 0,
        views: 0,
        monthlySales: {
            labels: [],
            data: []
        },
        productPerformance: [],
        reviews: []
    });
    
    const { currentUser } = useAuth();
    const { error: showError, success } = useNotification();
    
    // Check if user has seller permissions
    const isSeller = currentUser?.role === 'seller' || currentUser?.role === 'admin' || true; // Always true for demo
    
    React.useEffect(() => {
        if (isSeller) {
            loadSellerData();
            checkWeb3Connection();
        }
    }, [isSeller]);
    
    async function checkWeb3Connection() {
        try {
            if (window.localStorage.getItem('walletConnected') === 'true') {
                const connection = await connectWallet();
                const network = await connection.web3.eth.net.getNetworkType();
                const balance = await getJoyTokenBalance(connection.web3, connection.account);
                
                setWeb3Status({
                    connected: true,
                    network,
                    balance,
                    storeVerified: true // For demo purposes
                });
            }
        } catch (error) {
            console.error("Failed to check Web3 connection:", error);
            reportError(error);
        }
    }
    
    async function loadSellerData() {
        try {
            setLoading(true);
            
            // In a real app, this would fetch from API
            // For demo purposes, we'll use mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock store data
            const mockStoreData = {
                id: 'store-123',
                name: 'AI Innovation Labs',
                description: 'Cutting-edge AI models for various applications',
                logo: 'https://avatars.dicebear.com/api/jdenticon/ai-innovation-labs.svg',
                banner: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
                createdAt: '2023-05-15T10:00:00Z',
                status: 'active',
                rating: 4.8,
                reviewCount: 127,
                verified: true,
                contact: {
                    email: 'contact@aiinnovationlabs.com',
                    phone: '+1 (555) 123-4567',
                    website: 'https://aiinnovationlabs.com'
                },
                social: {
                    twitter: '@AIInnovLabs',
                    github: 'ai-innovation-labs',
                    linkedin: 'ai-innovation-labs'
                },
                policies: {
                    refund: 'We offer a 30-day money-back guarantee if you are not satisfied with our products.',
                    terms: 'All products are licensed for single-use unless otherwise specified.'
                },
                web3: {
                    walletAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
                    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                    network: 'polygon',
                    tokenGating: true,
                    nftCollection: 'https://opensea.io/collection/ai-innovation-labs'
                }
            };
            
            // Mock products data
            const mockProducts = [
                {
                    id: 'prod-1',
                    name: 'Advanced Text Generator',
                    description: 'State-of-the-art text generation model for various applications',
                    price: 79.99,
                    tokenPrice: '50 JOY',
                    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
                    category: 'text-generation',
                    sales: 156,
                    rating: 4.7,
                    status: 'active',
                    createdAt: '2023-06-10T08:30:00Z',
                    tokenId: 'nft-123456',
                    blockchain: {
                        network: 'polygon',
                        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                        tokenId: '1234',
                        mintedAt: '2023-06-11T10:15:22Z'
                    },
                    aiFeatures: {
                        modelType: 'GPT-based',
                        parameters: '1.5B',
                        finetuned: true,
                        languages: ['English', 'Spanish', 'French'],
                        apiAccess: true
                    }
                },
                {
                    id: 'prod-2',
                    name: 'Image Synthesis Pro',
                    description: 'High-quality image generation from text descriptions',
                    price: 99.99,
                    tokenPrice: '75 JOY',
                    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
                    category: 'image-generation',
                    sales: 89,
                    rating: 4.9,
                    status: 'active',
                    createdAt: '2023-07-05T14:20:00Z',
                    tokenId: 'nft-123457',
                    blockchain: {
                        network: 'polygon',
                        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                        tokenId: '1235',
                        mintedAt: '2023-07-06T09:22:15Z'
                    },
                    aiFeatures: {
                        modelType: 'Diffusion-based',
                        parameters: '850M',
                        finetuned: true,
                        resolution: '1024x1024',
                        apiAccess: true
                    }
                },
                {
                    id: 'prod-3',
                    name: 'Data Analysis Suite',
                    description: 'Comprehensive data analysis toolkit for business intelligence',
                    price: 129.99,
                    tokenPrice: '100 JOY',
                    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
                    category: 'data-analysis',
                    sales: 42,
                    rating: 4.5,
                    status: 'active',
                    createdAt: '2023-08-12T11:15:00Z',
                    tokenId: 'nft-123458',
                    blockchain: {
                        network: 'polygon',
                        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                        tokenId: '1236',
                        mintedAt: '2023-08-13T14:05:33Z'
                    },
                    aiFeatures: {
                        modelType: 'Statistical Analysis',
                        frameworks: ['PyTorch', 'TensorFlow'],
                        datasets: 'Compatible with CSV, JSON, SQL',
                        visualizations: true,
                        apiAccess: true
                    }
                },
                {
                    id: 'prod-4',
                    name: 'Voice Recognition System',
                    description: 'Advanced voice recognition and transcription service',
                    price: 69.99,
                    tokenPrice: '40 JOY',
                    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618',
                    category: 'audio-processing',
                    sales: 78,
                    rating: 4.6,
                    status: 'active',
                    createdAt: '2023-08-25T09:45:00Z',
                    tokenId: 'nft-123459',
                    blockchain: {
                        network: 'polygon',
                        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                        tokenId: '1237',
                        mintedAt: '2023-08-26T11:30:45Z'
                    },
                    aiFeatures: {
                        modelType: 'Transformer-based',
                        parameters: '600M',
                        languages: ['English', 'Spanish', 'German', 'French', 'Chinese'],
                        accuracy: '98%',
                        apiAccess: true
                    }
                }
            ];
            
            // Mock AI models data
            const mockAiModels = [
                {
                    id: 'ai-1',
                    name: 'TextGen-Pro',
                    description: 'Base model for text generation products',
                    type: 'Language Model',
                    architecture: 'Transformer',
                    parameters: '1.5B',
                    trainingStatus: 'completed',
                    trainingProgress: 100,
                    accuracy: 92.5,
                    lastUpdated: '2023-06-05T14:30:00Z',
                    deploymentStatus: 'active',
                    endpoints: [
                        {
                            type: 'REST API',
                            url: 'https://api.aiinnovationlabs.com/textgen-pro',
                            status: 'online'
                        },
                        {
                            type: 'WebSocket',
                            url: 'wss://api.aiinnovationlabs.com/textgen-pro/ws',
                            status: 'online'
                        }
                    ],
                    usedInProducts: ['prod-1']
                },
                {
                    id: 'ai-2',
                    name: 'ImageDiffusion-X',
                    description: 'Advanced image generation model',
                    type: 'Vision Model',
                    architecture: 'Diffusion',
                    parameters: '850M',
                    trainingStatus: 'completed',
                    trainingProgress: 100,
                    accuracy: 95.2,
                    lastUpdated: '2023-07-01T10:15:00Z',
                    deploymentStatus: 'active',
                    endpoints: [
                        {
                            type: 'REST API',
                            url: 'https://api.aiinnovationlabs.com/imagediffusion-x',
                            status: 'online'
                        }
                    ],
                    usedInProducts: ['prod-2']
                },
                {
                    id: 'ai-3',
                    name: 'DataAnalyzer-ML',
                    description: 'Statistical analysis and machine learning framework',
                    type: 'Analysis Model',
                    architecture: 'Ensemble',
                    parameters: '300M',
                    trainingStatus: 'completed',
                    trainingProgress: 100,
                    accuracy: 89.7,
                    lastUpdated: '2023-08-10T09:20:00Z',
                    deploymentStatus: 'active',
                    endpoints: [
                        {
                            type: 'REST API',
                            url: 'https://api.aiinnovationlabs.com/dataanalyzer-ml',
                            status: 'online'
                        },
                        {
                            type: 'GraphQL',
                            url: 'https://api.aiinnovationlabs.com/dataanalyzer-ml/graphql',
                            status: 'online'
                        }
                    ],
                    usedInProducts: ['prod-3']
                },
                {
                    id: 'ai-4',
                    name: 'VoiceTransformer',
                    description: 'Speech recognition and processing model',
                    type: 'Audio Model',
                    architecture: 'Transformer',
                    parameters: '600M',
                    trainingStatus: 'completed',
                    trainingProgress: 100,
                    accuracy: 94.3,
                    lastUpdated: '2023-08-22T16:45:00Z',
                    deploymentStatus: 'active',
                    endpoints: [
                        {
                            type: 'REST API',
                            url: 'https://api.aiinnovationlabs.com/voicetransformer',
                            status: 'online'
                        },
                        {
                            type: 'WebSocket',
                            url: 'wss://api.aiinnovationlabs.com/voicetransformer/ws',
                            status: 'online'
                        }
                    ],
                    usedInProducts: ['prod-4']
                },
                {
                    id: 'ai-5',
                    name: 'MultiModal-Fusion',
                    description: 'Experimental model combining text, image and audio processing',
                    type: 'Multimodal',
                    architecture: 'Hybrid Transformer',
                    parameters: '2.2B',
                    trainingStatus: 'training',
                    trainingProgress: 78,
                    accuracy: null,
                    lastUpdated: '2023-09-05T08:30:00Z',
                    deploymentStatus: 'development',
                    endpoints: [],
                    usedInProducts: []
                }
            ];
            
            // Mock sales data
            const mockSales = [
                {
                    id: 'sale-1',
                    product: 'Advanced Text Generator',
                    productId: 'prod-1',
                    customer: 'John Smith',
                    customerId: 'user-123',
                    customerWallet: '0x1a2b3c...4d5e6f',
                    amount: 79.99,
                    tokenAmount: '50 JOY',
                    date: '2023-09-10T14:32:00Z',
                    status: 'completed',
                    transactionHash: '0xabcd1234...5678efgh',
                    nftTransferred: true
                },
                {
                    id: 'sale-2',
                    product: 'Image Synthesis Pro',
                    productId: 'prod-2',
                    customer: 'Emily Johnson',
                    customerId: 'user-456',
                    customerWallet: '0x7g8h9i...0j1k2l',
                    amount: 99.99,
                    tokenAmount: '75 JOY',
                    date: '2023-09-09T10:15:00Z',
                    status: 'completed',
                    transactionHash: '0xijkl5678...9012mnop',
                    nftTransferred: true
                },
                {
                    id: 'sale-3',
                    product: 'Data Analysis Suite',
                    productId: 'prod-3',
                    customer: 'Michael Brown',
                    customerId: 'user-789',
                    customerWallet: '0x3m4n5o...6p7q8r',
                    amount: 129.99,
                    tokenAmount: '100 JOY',
                    date: '2023-09-08T16:45:00Z',
                    status: 'completed',
                    transactionHash: '0xqrst9012...3456uvwx',
                    nftTransferred: true
                },
                {
                    id: 'sale-4',
                    product: 'Voice Recognition System',
                    productId: 'prod-4',
                    customer: 'Sarah Davis',
                    customerId: 'user-101',
                    customerWallet: '0x9s0t1u...2v3w4x',
                    amount: 69.99,
                    tokenAmount: '40 JOY',
                    date: '2023-09-08T09:20:00Z',
                    status: 'completed',
                    transactionHash: '0xyzab7890...1234cdef',
                    nftTransferred: true
                },
                {
                    id: 'sale-5',
                    product: 'Advanced Text Generator',
                    productId: 'prod-1',
                    customer: 'Robert Wilson',
                    customerId: 'user-202',
                    customerWallet: '0x5y6z7a...8b9c0d',
                    amount: 79.99,
                    tokenAmount: '50 JOY',
                    date: '2023-09-07T13:10:00Z',
                    status: 'completed',
                    transactionHash: '0xghij3456...7890klmn',
                    nftTransferred: true
                }
            ];
            
            // Mock reviews
            const mockReviews = [
                {
                    id: 'review-1',
                    productId: 'prod-1',
                    productName: 'Advanced Text Generator',
                    customer: 'John Smith',
                    customerId: 'user-123',
                    customerWallet: '0x1a2b3c...4d5e6f',
                    rating: 5,
                    comment: 'Excellent text generation model! The quality is outstanding and it has greatly improved our content creation process.',
                    date: '2023-09-05T14:32:00Z',
                    status: 'published',
                    verifiedPurchase: true,
                    verifiedOnChain: true,
                    transactionHash: '0xabcd1234...5678efgh'
                },
                {
                    id: 'review-2',
                    productId: 'prod-2',
                    productName: 'Image Synthesis Pro',
                    customer: 'Emily Johnson',
                    customerId: 'user-456',
                    customerWallet: '0x7g8h9i...0j1k2l',
                    rating: 4,
                    comment: 'Very good image generation capabilities. The only reason I\'m not giving 5 stars is because it sometimes struggles with complex scenes.',
                    date: '2023-09-04T10:15:00Z',
                    status: 'published',
                    verifiedPurchase: true,
                    verifiedOnChain: true,
                    transactionHash: '0xijkl5678...9012mnop'
                },
                {
                    id: 'review-3',
                    productId: 'prod-3',
                    productName: 'Data Analysis Suite',
                    customer: 'Michael Brown',
                    customerId: 'user-789',
                    customerWallet: '0x3m4n5o...6p7q8r',
                    rating: 5,
                    comment: 'This data analysis tool is a game-changer for our business intelligence team. Highly recommended!',
                    date: '2023-09-03T16:45:00Z',
                    status: 'published',
                    verifiedPurchase: true,
                    verifiedOnChain: true,
                    transactionHash: '0xqrst9012...3456uvwx'
                },
                {
                    id: 'review-4',
                    productId: 'prod-4',
                    productName: 'Voice Recognition System',
                    customer: 'Sarah Davis',
                    customerId: 'user-101',
                    customerWallet: '0x9s0t1u...2v3w4x',
                    rating: 4,
                    comment: 'Works very well for most accents, but has some trouble with specific regional dialects. Otherwise excellent!',
                    date: '2023-09-02T09:20:00Z',
                    status: 'published',
                    verifiedPurchase: true,
                    verifiedOnChain: true,
                    transactionHash: '0xyzab7890...1234cdef'
                }
            ];
            
            // Calculate analytics
            const totalRevenue = mockSales.reduce((sum, sale) => sum + sale.amount, 0);
            const totalSales = mockSales.length;
            const averageRating = mockProducts.reduce((sum, product) => sum + product.rating, 0) / mockProducts.length;
            
            const analyticsData = {
                totalRevenue,
                totalSales,
                averageRating,
                views: 1245,
                monthlySales: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    data: [12, 19, 15, 17, 22, 24, 20, 26, 30]
                },
                productPerformance: mockProducts.map(p => ({
                    name: p.name,
                    sales: p.sales,
                    revenue: p.sales * p.price
                })),
                reviews: mockReviews
            };
            
            setStoreData(mockStoreData);
            setProducts(mockProducts);
            setSales(mockSales);
            setAnalytics(analyticsData);
            setAiModels(mockAiModels);
            
        } catch (error) {
            console.error("Failed to load seller data:", error);
            reportError(error);
            showError('Failed to load seller data');
        } finally {
            setLoading(false);
        }
    }
    
    async function handleConnectWallet() {
        try {
            setLoading(true);
            const connection = await connectWallet();
            const network = await connection.web3.eth.net.getNetworkType();
            const balance = await getJoyTokenBalance(connection.web3, connection.account);
            
            setWeb3Status({
                connected: true,
                network,
                balance,
                storeVerified: true // For demo purposes
            });
            
            success('Wallet connected successfully');
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            reportError(error);
            showError('Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    }
    
    if (!isSeller) {
        return <SellerOnboarding />;
    }
    
    const sellerSections = [
        { id: 'overview', label: 'Overview', icon: 'fa-home' },
        { id: 'products', label: 'Products', icon: 'fa-cubes' },
        { id: 'ai-models', label: 'AI Models', icon: 'fa-robot' },
        { id: 'orders', label: 'Orders', icon: 'fa-shopping-cart' },
        { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
        { id: 'reviews', label: 'Reviews', icon: 'fa-star' },
        { id: 'blockchain', label: 'Blockchain', icon: 'fa-link' },
        { id: 'settings', label: 'Store Settings', icon: 'fa-cog' }
    ];
    
    return (
        <div className="container mx-auto px-4 py-20" data-name="seller-dashboard">
            <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
            
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1" data-name="seller-sidebar">
                        <SellerSidebar 
                            storeData={storeData}
                            web3Status={web3Status}
                            activeSection={activeSection}
                            sellerSections={sellerSections}
                            onSectionChange={setActiveSection}
                            onConnectWallet={handleConnectWallet}
                        />
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-4" data-name="seller-content">
                        <SellerContent 
                            activeSection={activeSection}
                            analytics={analytics}
                            products={products}
                            sales={sales}
                            aiModels={aiModels}
                            storeData={storeData}
                            web3Status={web3Status}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
