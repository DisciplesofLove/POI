function PaymentModal({ model, onClose, onSuccess }) {
    const [loading, setLoading] = React.useState(false);
    const [step, setStep] = React.useState('confirm'); // confirm, processing, success, error
    const [error, setError] = React.useState(null);
    const [transaction, setTransaction] = React.useState(null);
    const { success, error: showError } = useNotification();
    const { currentUser } = useAuth();

    async function handlePayment() {
        if (!currentUser) {
            showError('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);
            setStep('processing');
            setError(null);

            // Send payment
            const { transaction: tx } = await sendPayment(model.author, model.price);
            setTransaction(tx);

            // Wait for confirmation
            const receipt = await checkTransactionStatus(tx.transactionHash);
            
            if (receipt.status) {
                // Create order record
                const order = await createOrder({
                    listing_id: model.id,
                    buyer_id: currentUser.id,
                    seller_id: model.author_id,
                    amount: model.price,
                    status: 'completed',
                    transaction_hash: tx.transactionHash
                });

                setStep('success');
                success('Payment successful!');
                
                if (onSuccess) {
                    onSuccess(order);
                }
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Payment failed:', error);
            setError(error.message);
            setStep('error');
            showError('Payment failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold">Complete Purchase</h2>
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="text-gray-400 hover:text-white"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    {step === 'confirm' && (
                        <div>
                            <div className="bg-white/5 rounded-lg p-4 mb-6">
                                <h3 className="font-medium mb-4">Order Summary</h3>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Item</span>
                                    <span>{model.name}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Price</span>
                                    <div className="flex items-center">
                                        <img 
                                            src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg" 
                                            alt="MATIC" 
                                            className="w-4 h-4 mr-1"
                                        />
                                        <span>{model.price} MATIC</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Seller</span>
                                    <span className="font-mono">{window.formatWalletAddress(model.author)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-primary-main hover:bg-primary-dark py-3 rounded-lg font-semibold"
                            >
                                Confirm Payment
                            </button>

                            <p className="text-sm text-gray-400 text-center mt-4">
                                By clicking confirm, you agree to the terms of service and will be prompted to approve the transaction in your wallet.
                            </p>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-primary-main/20 border-t-primary-main rounded-full animate-spin mx-auto mb-4"></div>
                            <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
                            <p className="text-gray-400">
                                Please wait while we process your payment...
                            </p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-success-main/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-check text-success-light text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                            <p className="text-gray-400 mb-4">
                                Your payment has been processed successfully.
                            </p>
                            {transaction && (
                                <div className="bg-white/5 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-400 mb-2">Transaction Hash:</p>
                                    <p className="font-mono text-sm break-all">
                                        {transaction.transactionHash}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-error-main/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-times text-error-light text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
                            {error && (
                                <p className="text-error-light mb-4">{error}</p>
                            )}
                            <button
                                onClick={() => setStep('confirm')}
                                className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
