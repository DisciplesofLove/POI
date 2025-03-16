function SellerOrders({ orders }) {
    try {
        const [selectedOrder, setSelectedOrder] = React.useState(null);
        const [filterStatus, setFilterStatus] = React.useState('all');
        const { error: showError } = useNotification();

        const filteredOrders = filterStatus === 'all' 
            ? orders 
            : orders.filter(order => order.status === filterStatus);

        const handleViewOrder = (order) => {
            setSelectedOrder(order);
        };

        const handleCloseModal = () => {
            setSelectedOrder(null);
        };

        return (
            <div data-name="seller-orders">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Orders</h2>
                    <div className="flex space-x-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm"
                        >
                            <option value="all">All Orders</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg">
                            <i className="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                
                <div className="glass-effect rounded-xl p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                    <th className="pb-3 pl-2">Order ID</th>
                                    <th className="pb-3">Product</th>
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right pr-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 pl-2">
                                            <span className="font-mono text-sm">{order.id}</span>
                                        </td>
                                        <td className="py-3">{order.product}</td>
                                        <td className="py-3">{order.customer}</td>
                                        <td className="py-3">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="py-3">${order.amount.toFixed(2)}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                order.status === 'completed' ? 'bg-success-main/20 text-success-light' : 
                                                order.status === 'processing' ? 'bg-warning-main/20 text-warning-light' :
                                                'bg-error-main/20 text-error-light'
                                            }`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right pr-2">
                                            <button 
                                                className="p-2 hover:bg-white/10 rounded-lg"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No orders found</p>
                        </div>
                    )}
                </div>
                
                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="glass-effect rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Order Details</h2>
                                        <p className="text-sm text-gray-400">Order ID: {selectedOrder.id}</p>
                                    </div>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-sm text-gray-400">Date</p>
                                            <p className="font-medium">{new Date(selectedOrder.date).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-sm text-gray-400">Status</p>
                                            <p className={`font-medium ${
                                                selectedOrder.status === 'completed' ? 'text-success-light' : 
                                                selectedOrder.status === 'processing' ? 'text-warning-light' :
                                                'text-error-light'
                                            }`}>
                                                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h3 className="font-semibold">Customer Information</h3>
                                        <div className="bg-white/5 p-4 rounded-lg">
                                            <p><strong>Name:</strong> {selectedOrder.customer}</p>
                                            <p><strong>Customer ID:</strong> {selectedOrder.customerId}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h3 className="font-semibold">Order Details</h3>
                                        <div className="bg-white/5 p-4 rounded-lg">
                                            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                                                <div>
                                                    <p className="font-medium">{selectedOrder.product}</p>
                                                    <p className="text-sm text-gray-400">Product ID: {selectedOrder.productId}</p>
                                                </div>
                                                <p className="font-medium">${selectedOrder.amount.toFixed(2)}</p>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <p>Total</p>
                                                <p className="font-bold">${selectedOrder.amount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                                        <button 
                                            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
                                            onClick={handleCloseModal}
                                        >
                                            Close
                                        </button>
                                        <button className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg">
                                            Download Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("SellerOrders render error:", error);
        reportError(error);
        return (
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Orders</h2>
                <p className="text-gray-400">There was an error loading the orders data.</p>
            </div>
        );
    }
}
