function JoyTokenStaking({ userAddress }) {
    const [stakingAmount, setStakingAmount] = React.useState('');
    const [withdrawAmount, setWithdrawAmount] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [userStaking, setUserStaking] = React.useState({
        stakedAmount: '0',
        availableRewards: '0',
        stakingSince: null,
        apy: '12.5'
    });
    const { success, error: showError } = useNotification();
    const [balance, setBalance] = React.useState('0');
    const [tab, setTab] = React.useState('stake');

    React.useEffect(() => {
        if (userAddress) {
            loadUserStakingData();
        }
    }, [userAddress]);

    async function loadUserStakingData() {
        try {
            setLoading(true);
            // In a real app, this would fetch data from the blockchain
            // For demo purposes, we'll use mock data
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setUserStaking({
                stakedAmount: '250',
                availableRewards: '12.5',
                stakingSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                apy: '12.5'
            });
            
            setBalance('500');
        } catch (error) {
            console.error("Failed to load staking data:", error);
            reportError(error);
            showError('Failed to load staking data');
        } finally {
            setLoading(false);
        }
    }

    async function handleStake(e) {
        e.preventDefault();
        
        if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
            showError('Please enter a valid amount to stake');
            return;
        }
        
        try {
            setLoading(true);
            
            // In a real app, this would call the staking contract
            // For demo purposes, we'll just simulate a successful stake
            
            // Simulate blockchain delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update user staking data
            setUserStaking(prev => ({
                ...prev,
                stakedAmount: (parseFloat(prev.stakedAmount) + parseFloat(stakingAmount)).toString()
            }));
            
            // Update balance
            setBalance(prev => (parseFloat(prev) - parseFloat(stakingAmount)).toString());
            
            // Reset form
            setStakingAmount('');
            
            success('Successfully staked JOY tokens!');
        } catch (error) {
            console.error("Failed to stake tokens:", error);
            reportError(error);
            showError('Failed to stake tokens');
        } finally {
            setLoading(false);
        }
    }

    async function handleWithdraw(e) {
        e.preventDefault();
        
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            showError('Please enter a valid amount to withdraw');
            return;
        }
        
        if (parseFloat(withdrawAmount) > parseFloat(userStaking.stakedAmount)) {
            showError('You cannot withdraw more than your staked amount');
            return;
        }
        
        try {
            setLoading(true);
            
            // In a real app, this would call the staking contract
            // For demo purposes, we'll just simulate a successful withdrawal
            
            // Simulate blockchain delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update user staking data
            setUserStaking(prev => ({
                ...prev,
                stakedAmount: (parseFloat(prev.stakedAmount) - parseFloat(withdrawAmount)).toString()
            }));
            
            // Update balance
            setBalance(prev => (parseFloat(prev) + parseFloat(withdrawAmount)).toString());
            
            // Reset form
            setWithdrawAmount('');
            
            success('Successfully withdrawn JOY tokens!');
        } catch (error) {
            console.error("Failed to withdraw tokens:", error);
            reportError(error);
            showError('Failed to withdraw tokens');
        } finally {
            setLoading(false);
        }
    }

    async function handleClaimRewards() {
        try {
            if (parseFloat(userStaking.availableRewards) <= 0) {
                showError('No rewards available to claim');
                return;
            }
            
            setLoading(true);
            
            // In a real app, this would call the staking contract
            // For demo purposes, we'll just simulate a successful claim
            
            // Simulate blockchain delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update balance
            setBalance(prev => (parseFloat(prev) + parseFloat(userStaking.availableRewards)).toString());
            
            // Reset rewards
            setUserStaking(prev => ({
                ...prev,
                availableRewards: '0'
            }));
            
            success('Successfully claimed rewards!');
        } catch (error) {
            console.error("Failed to claim rewards:", error);
            reportError(error);
            showError('Failed to claim rewards');
        } finally {
            setLoading(false);
        }
    }

    if (!userAddress) {
        return (
            <div className="glass-effect rounded-xl p-8 text-center">
                <div className="text-5xl text-gray-500 mb-4">
                    <i className="fas fa-wallet"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Wallet Not Connected</h3>
                <p className="text-gray-400 mb-6">
                    Please connect your wallet to access staking features.
                </p>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                    onClick={() => window.connectWallet()}
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="glass-effect rounded-xl p-6" data-name="staking-container">
            <h2 className="text-3xl font-bold mb-6">JOY Token Staking</h2>
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-name="staking-overview">
                <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-sm text-gray-400 mb-2">Total Staked</h3>
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-main/20 flex items-center justify-center mr-3">
                            <i className="fas fa-coins text-primary-light"></i>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{userStaking.stakedAmount} JOY</p>
                            {userStaking.stakingSince && (
                                <p className="text-xs text-gray-400">
                                    Staking since {userStaking.stakingSince.toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-sm text-gray-400 mb-2">Available Rewards</h3>
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-success-main/20 flex items-center justify-center mr-3">
                            <i className="fas fa-gift text-success-light"></i>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{userStaking.availableRewards} JOY</p>
                            <button 
                                className={`text-xs ${parseFloat(userStaking.availableRewards) > 0 ? 'text-success-light hover:text-success-main' : 'text-gray-400 cursor-not-allowed'}`}
                                onClick={handleClaimRewards}
                                disabled={parseFloat(userStaking.availableRewards) <= 0 || loading}
                            >
                                {parseFloat(userStaking.availableRewards) > 0 ? 'Claim Now' : 'No rewards available'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-sm text-gray-400 mb-2">Current APY</h3>
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-info-main/20 flex items-center justify-center mr-3">
                            <i className="fas fa-chart-line text-info-light"></i>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{userStaking.apy}%</p>
                            <p className="text-xs text-gray-400">Annual Percentage Yield</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Balance Display */}
            <div className="mb-8 p-4 bg-white/5 rounded-lg" data-name="wallet-balance">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm text-gray-400">Wallet Balance</h3>
                        <p className="text-xl font-bold">{balance} JOY</p>
                    </div>
                    <button
                        className="text-primary-light hover:text-primary-main text-sm"
                        onClick={loadUserStakingData}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                Refreshing...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <i className="fas fa-sync-alt mr-1"></i>
                                Refresh
                            </span>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-white/10" data-name="staking-tabs">
                <div className="flex space-x-6">
                    <button 
                        className={`pb-3 px-1 ${tab === 'stake' ? 'text-primary-light border-b-2 border-primary-light' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setTab('stake')}
                    >
                        Stake Tokens
                    </button>
                    <button 
                        className={`pb-3 px-1 ${tab === 'withdraw' ? 'text-primary-light border-b-2 border-primary-light' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setTab('withdraw')}
                    >
                        Withdraw Tokens
                    </button>
                </div>
            </div>
            
            {/* Staking Form */}
            {tab === 'stake' && (
                <div data-name="staking-form">
                    <form onSubmit={handleStake} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount to Stake (JOY)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={stakingAmount}
                                    onChange={(e) => setStakingAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pr-20 text-white"
                                    placeholder="0.0"
                                    min="0"
                                    step="any"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-light text-sm"
                                    onClick={() => setStakingAmount(balance)}
                                    disabled={loading}
                                >
                                    MAX
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Available: {balance} JOY
                            </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Staking Period</span>
                                <span>Flexible</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Annual Yield</span>
                                <span>{userStaking.apy}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Rewards Distribution</span>
                                <span>Daily</span>
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg font-semibold ${
                                loading || !stakingAmount || parseFloat(stakingAmount) <= 0 || parseFloat(stakingAmount) > parseFloat(balance)
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-primary-main hover:bg-primary-dark'
                            }`}
                            disabled={loading || !stakingAmount || parseFloat(stakingAmount) <= 0 || parseFloat(stakingAmount) > parseFloat(balance)}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Processing...
                                </span>
                            ) : 'Stake Tokens'}
                        </button>
                    </form>
                </div>
            )}
            
            {/* Withdrawal Form */}
            {tab === 'withdraw' && (
                <div data-name="withdrawal-form">
                    <form onSubmit={handleWithdraw} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount to Withdraw (JOY)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pr-20 text-white"
                                    placeholder="0.0"
                                    min="0"
                                    max={userStaking.stakedAmount}
                                    step="any"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-light text-sm"
                                    onClick={() => setWithdrawAmount(userStaking.stakedAmount)}
                                    disabled={loading}
                                >
                                    MAX
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Staked: {userStaking.stakedAmount} JOY
                            </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Withdrawal Fee</span>
                                <span>0%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Processing Time</span>
                                <span>Instant</span>
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg font-semibold ${
                                loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(userStaking.stakedAmount)
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-primary-main hover:bg-primary-dark'
                            }`}
                            disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(userStaking.stakedAmount)}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Processing...
                                </span>
                            ) : 'Withdraw Tokens'}
                        </button>
                    </form>
                </div>
            )}
            
            {/* Staking Info */}
            <div className="mt-8 pt-6 border-t border-white/10" data-name="staking-info">
                <h3 className="text-lg font-semibold mb-4">About JOY Staking</h3>
                <div className="space-y-4 text-sm text-gray-300">
                    <p>
                        Stake your JOY tokens to earn rewards and participate in platform governance. 
                        Your staked tokens help secure the network and validate AI model transactions.
                    </p>
                    <p>
                        Benefits of staking:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Earn passive income through staking rewards</li>
                        <li>Participate in governance proposals and voting</li>
                        <li>Access to exclusive platform features</li>
                        <li>Help secure and validate the JoyNet ecosystem</li>
                    </ul>
                    <p>
                        Rewards are calculated daily based on your staked amount and the current APY.
                        You can claim your rewards at any time or let them accumulate.
                    </p>
                </div>
            </div>
        </div>
    );
}
