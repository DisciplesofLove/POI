import NavLinks from './nav/NavLinks';

function Navbar({ walletConnected, account, onConnect, onDisconnect, onNavigate }) {
    try {
        const [isMenuOpen, setIsMenuOpen] = React.useState(false);
        const [activeDropdown, setActiveDropdown] = React.useState(null);
        const [connecting, setConnecting] = React.useState(false);
        const { currentUser } = useAuth();
        const { error: showError } = useNotification();
        // Add delay for menu closing to improve usability
        const closeTimeout = React.useRef(null);
        const dropdownRefs = React.useRef({});

        const menuItems = {
            marketplace: [
                { label: "AI Models", href: "/browse/models" },
                { label: "Datasets", href: "/browse/datasets" },
                { label: "Services", href: "/browse/services" },
                { label: "Algorithms", href: "/browse/algorithms" },
                { label: "Training", href: "/browse/training" },
                { label: "Create Store", href: "/create-store" }
            ],
            community: [
                { label: "Forums", href: "/community/forums" },
                { label: "Blog", href: "/community/blog" },
                { label: "Events", href: "/community/events" },
                { label: "Projects", href: "/community/projects" },
                { label: "Challenges", href: "/community/challenges" },
                { label: "Members", href: "/community/members" }
            ],
            resources: [
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/api" },
                { label: "Tutorials", href: "/tutorials" },
                { label: "Case Studies", href: "/case-studies" },
                { label: "Help Center", href: "/help" },
                { label: "Contact", href: "/contact" }
            ]
        };

        async function handleConnect() {
            try {
                setConnecting(true);
                const connection = await connectWallet();
                onConnect(connection);
            } catch (error) {
                showError('Failed to connect wallet');
                reportError(error);
            } finally {
                setConnecting(false);
            }
        }

        function handleNavigation(href) {
            setIsMenuOpen(false);
            setActiveDropdown(null);
            onNavigate(href);
        }

        // Handle dropdown menu hover with delay
        function handleMenuEnter(category) {
            if (closeTimeout.current) {
                clearTimeout(closeTimeout.current);
                closeTimeout.current = null;
            }
            setActiveDropdown(category);
        }

        function handleMenuLeave(category) {
            closeTimeout.current = setTimeout(() => {
                if (activeDropdown === category) {
                    setActiveDropdown(null);
                }
            }, 300); // 300ms delay before closing menu
        }

        // Function to check if mouse is still within the dropdown area
        function handleDropdownMouseMove(e, category) {
            if (!dropdownRefs.current[category]) return;
            
            const rect = dropdownRefs.current[category].getBoundingClientRect();
            const isInside = 
                e.clientX >= rect.left && 
                e.clientX <= rect.right && 
                e.clientY >= rect.top && 
                e.clientY <= rect.bottom;
            
            if (!isInside && activeDropdown === category) {
                handleMenuLeave(category);
            }
        }

        // Set up refs for dropdowns
        React.useEffect(() => {
            // Add mousemove event listener to track when cursor leaves dropdown area
            const handleGlobalMouseMove = (e) => {
                if (activeDropdown) {
                    handleDropdownMouseMove(e, activeDropdown);
                }
            };
            
            document.addEventListener('mousemove', handleGlobalMouseMove);
            
            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                if (closeTimeout.current) {
                    clearTimeout(closeTimeout.current);
                }
            };
        }, [activeDropdown]);

        return (
            <nav className="navbar fixed w-full z-50 px-4 py-3" data-name="navbar">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4" data-name="navbar-left">
                        <div 
                            className="cursor-pointer" 
                            onClick={() => handleNavigation('/')}
                            data-name="navbar-logo"
                        >
                            <img 
                                src="https://app.trickle.so/storage/public/images/usr_0b8d952560000001/777fb829-7fc3-4a90-be3c-32c255889212.png" 
                                alt="JoyNet Logo" 
                                className="h-10"
                            />
                        </div>
                    </div>
                    
                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-8" data-name="navbar-desktop-menu">
                        {Object.entries(menuItems).map(([category, items]) => (
                            <div 
                                key={category}
                                className="relative dropdown"
                                onMouseEnter={() => handleMenuEnter(category)}
                                onMouseLeave={() => handleMenuLeave(category)}
                                ref={el => dropdownRefs.current[category] = el}
                                data-name={`navbar-dropdown-${category}`}
                            >
                                <button className="text-white hover:text-primary-light flex items-center">
                                    <span className="capitalize">{category}</span>
                                    <i className="fas fa-chevron-down ml-2 text-xs"></i>
                                </button>
                                
                                <div 
                                    className={`dropdown-menu absolute top-full left-0 mt-2 w-56 rounded-lg bg-gray-800 shadow-xl z-50 ${
                                        activeDropdown === category ? 'opacity-100 visible' : 'opacity-0 invisible'
                                    }`}
                                >
                                    <div className="py-2 px-1">
                                        {items.map(item => (
                                            <a
                                                key={item.href}
                                                onClick={() => handleNavigation(item.href)}
                                                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-main/40 rounded-lg cursor-pointer"
                                            >
                                                {item.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Wallet Connect Button - Desktop */}
                    <div className="hidden lg:flex items-center space-x-4" data-name="navbar-right">
                        {walletConnected ? (
                            <div className="flex items-center space-x-4">
                                <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-mono text-white">
                                        {window.formatWalletAddress(account)}
                                    </span>
                                </div>
                                <div className="relative dropdown">
                                    <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg text-white">
                                        <i className="fas fa-user-circle"></i>
                                    </button>
                                    <div className="dropdown-menu absolute top-full right-0 mt-2 w-48 rounded-lg bg-gray-800 shadow-xl z-50 opacity-0 invisible">
                                        <div className="py-2">
                                            <a 
                                                onClick={() => handleNavigation('/profile')}
                                                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-main/40 cursor-pointer"
                                            >
                                                Profile
                                            </a>
                                            <a 
                                                onClick={() => handleNavigation('/dashboard')}
                                                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-main/40 cursor-pointer"
                                            >
                                                Dashboard
                                            </a>
                                            <a 
                                                onClick={() => handleNavigation('/settings')}
                                                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-main/40 cursor-pointer"
                                            >
                                                Settings
                                            </a>
                                            <a 
                                                onClick={onDisconnect}
                                                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-main/40 cursor-pointer"
                                            >
                                                Disconnect
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={connecting}
                                className={`
                                    px-4 py-2 rounded-lg font-semibold text-white
                                    ${connecting 
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-primary-main hover:bg-primary-dark'}
                                `}
                                data-name="connect-wallet-button"
                            >
                                {connecting ? (
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
                        )}
                    </div>
                    
                    {/* Hamburger Menu Button */}
                    <button 
                        className="lg:hidden text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        data-name="navbar-hamburger"
                    >
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                    </button>

                    {/* Mobile Menu */}
                    <div className={`
                        fixed top-[60px] left-0 w-full bg-gray-800/95 lg:hidden
                        transition-transform duration-300 ease-in-out overflow-y-auto
                        max-h-[calc(100vh-60px)] z-50 border-t border-white/10
                        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                    `} data-name="navbar-mobile-menu">
                        <div className="p-4 space-y-4">
                            {Object.entries(menuItems).map(([category, items]) => (
                                <div key={category} className="space-y-2">
                                    <h3 className="text-white font-semibold uppercase text-sm">
                                        {category}
                                    </h3>
                                    {items.map(item => (
                                        <a 
                                            key={item.href}
                                            onClick={() => handleNavigation(item.href)}
                                            className="block text-gray-300 hover:text-white hover:bg-primary-main/30 py-2 pl-4 cursor-pointer rounded-lg"
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </div>
                            ))}
                            
                            <div className="pt-4 border-t border-white/10">
                                {walletConnected ? (
                                    <div className="flex flex-col space-y-2">
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-mono text-white">
                                                    {window.formatWalletAddress(account)}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white"
                                            onClick={onDisconnect}
                                        >
                                            Disconnect Wallet
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleConnect}
                                        disabled={connecting}
                                        className={`
                                            w-full px-4 py-2 rounded-lg font-semibold text-white
                                            ${connecting 
                                                ? 'bg-gray-600 cursor-not-allowed'
                                                : 'bg-primary-main hover:bg-primary-dark'}
                                        `}
                                    >
                                        {connecting ? (
                                            <span className="flex items-center justify-center">
                                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                                Connecting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <i className="fas fa-wallet mr-2"></i>
                                                Connect Wallet
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    } catch (error) {
        console.error("Navbar render error:", error);
        reportError(error);
        
        // Fallback simple navbar in case of error
        return (
            <nav className="navbar fixed w-full z-50 px-4 py-3">
                <div className="container mx-auto flex justify-between items-center">
                    <div data-name="navbar-logo">
                        <img 
                            src="https://app.trickle.so/storage/public/images/usr_0b8d952560000001/777fb829-7fc3-4a90-be3c-32c255889212.png" 
                            alt="JoyNet Logo" 
                            className="h-10"
                        />
                    </div>
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg text-white"
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </button>
                </div>
            </nav>
        );
    }
}
