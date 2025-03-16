function App() {
    const [page, setPage] = React.useState(window.location.pathname);
    const [walletConnected, setWalletConnected] = React.useState(false);
    const [account, setAccount] = React.useState(null);
    const { NotificationContainer } = useNotification();
    const [web3Connection, setWeb3Connection] = React.useState(null);

    React.useEffect(() => {
        const handleRouteChange = () => {
            setPage(window.location.pathname);
        };

        window.addEventListener('popstate', handleRouteChange);
        
        // Check if wallet was previously connected
        const checkWalletConnection = async () => {
            try {
                if (window.localStorage.getItem('walletConnected') === 'true') {
                    const connection = await connectWallet();
                    if (connection && connection.account) {
                        handleWalletConnect(connection);
                    }
                }
            } catch (error) {
                console.error("Failed to reconnect wallet:", error);
                reportError(error);
                window.localStorage.removeItem('walletConnected');
            }
        };
        
        checkWalletConnection();
        
        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    function navigate(path) {
        window.history.pushState({}, '', path);
        setPage(path);
        window.scrollTo(0, 0);
    }

    async function handleWalletConnect(connection) {
        try {
            if (!connection || !connection.account) {
                throw new Error('Invalid wallet connection response');
            }
            setWalletConnected(true);
            setAccount(connection.account);
            setWeb3Connection(connection);
            window.localStorage.setItem('walletConnected', 'true');
        } catch (error) {
            console.error("Failed to handle wallet connection:", error);
            reportError(error);
            // Reset wallet connection state
            setWalletConnected(false);
            setAccount(null);
            setWeb3Connection(null);
            window.localStorage.removeItem('walletConnected');
        }
    }

    async function handleWalletDisconnect() {
        try {
            await disconnectWallet();
            setWalletConnected(false);
            setAccount(null);
            setWeb3Connection(null);
            window.localStorage.removeItem('walletConnected');
        } catch (error) {
            console.error("Failed to disconnect wallet:", error);
            reportError(error);
        }
    }

    function renderPage() {
        try {
            switch(page) {
                case '/':
                    return (
                        <div>
                            <Hero onConnect={handleWalletConnect} />
                            <FeaturedModels />
                            <RecentModels />
                            <TopModels />
                            <Newsletter />
                        </div>
                    );
                case '/browse/models':
                    return <AIModelsPage />;
                case '/browse/datasets':
                    return <DatasetsPage />;
                case '/browse/services':
                    return <ServicesPage />;
                case '/browse/algorithms':
                    return <AlgorithmsPage />;
                case '/browse/training':
                    return <TrainingPage />;
                case '/create-store':
                    return <CreateStore />;
                case '/community/forums':
                    return <ForumsPage />;
                case '/community/blog':
                    return <BlogPage />;
                case '/community/events':
                    return <EventsPage />;
                case '/community/projects':
                    return <ProjectsPage />;
                case '/community/challenges':
                    return <ChallengesPage />;
                case '/community/members':
                    return <MembersPage />;
                case '/docs':
                    return <DocumentationPage />;
                case '/api':
                    return <APIReferencePage />;
                case '/tutorials':
                    return <TutorialsPage />;
                case '/case-studies':
                    return <CaseStudiesPage />;
                case '/help':
                    return <HelpCenterPage />;
                case '/staking':
                    return <StakingPage />;
                case '/settings':
                    return <SettingsPage />;
                case '/contact':
                    return <ContactPage />;
                case '/profile':
                    return <ProfilePage />;
                case '/dashboard':
                    return <DashboardPage walletConnected={walletConnected} account={account} />;
                default:
                    return <NotFoundPage />;
            }
        } catch (error) {
            console.error("Error rendering page:", error);
            reportError(error);
            return (
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Error Loading Page</h2>
                    <p className="text-gray-400 mb-8">There was an error loading the requested page.</p>
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
    }

    // Format wallet address to show only first and last few characters
    function formatWalletAddress(address, prefixLength = 6, suffixLength = 4) {
        if (!address) return '';
        return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
    }

    // Global function to navigate between pages
    window.navigateTo = navigate;

    // Global function to format wallet addresses
    window.formatWalletAddress = formatWalletAddress;

    return (
        <React.Fragment>
            <Navbar 
                walletConnected={walletConnected} 
                account={account}
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                onNavigate={navigate}
            />
            
            <main>
                {renderPage()}
            </main>
            
            <Footer onNavigate={navigate} />
            
            {/* Chat Widget */}
            <ChatWidget />
            
            <NotificationContainer />
        </React.Fragment>
    );
}

// Initialize the app
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

// Add a global error handler
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    reportError(event.error);
});

// Add a global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    reportError(event.reason);
});
