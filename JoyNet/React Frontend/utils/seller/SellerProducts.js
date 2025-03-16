function SellerProducts({ products }) {
    try {
        const [selectedProduct, setSelectedProduct] = React.useState(null);
        const [isEditing, setIsEditing] = React.useState(false);
        const { success, error: showError } = useNotification();
        
        const handleEditProduct = (product) => {
            setSelectedProduct(product);
            setIsEditing(true);
        };
        
        const handleViewProduct = (product) => {
            setSelectedProduct(product);
            setIsEditing(false);
        };
        
        const handleCloseModal = () => {
            setSelectedProduct(null);
            setIsEditing(false);
        };
        
        const handleDeleteProduct = (productId) => {
            // In a real app, this would call an API to delete the product
            showError('This feature is not implemented in the demo.');
        };
        
        return (
            <div data-name="seller-products">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Your Products</h2>
                    <button className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg flex items-center">
                        <i className="fas fa-plus mr-2"></i>
                        Add New Product
                    </button>
                </div>
                
                <div className="glass-effect rounded-xl p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                    <th className="pb-3 pl-2">Product</th>
                                    <th className="pb-3">Category</th>
                                    <th className="pb-3">Price</th>
                                    <th className="pb-3">Sales</th>
                                    <th className="pb-3">Rating</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right pr-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 pl-2">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">{product.category}</td>
                                        <td className="py-3">${product.price.toFixed(2)}</td>
                                        <td className="py-3">{product.sales}</td>
                                        <td className="py-3">
                                            <div className="flex items-center">
                                                <i className="fas fa-star text-yellow-500 mr-1"></i>
                                                <span>{product.rating}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                product.status === 'active' 
                                                    ? 'bg-success-main/20 text-success-light' 
                                                    : 'bg-warning-main/20 text-warning-light'
                                            }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right pr-2">
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    className="p-2 hover:bg-white/10 rounded-lg"
                                                    onClick={() => handleViewProduct(product)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button 
                                                    className="p-2 hover:bg-white/10 rounded-lg"
                                                    onClick={() => handleEditProduct(product)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="p-2 hover:bg-white/10 rounded-lg text-error-light"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Product Modal */}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="glass-effect rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold">
                                        {isEditing ? 'Edit Product' : 'Product Details'}
                                    </h2>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>
                                
                                {isEditing ? (
                                    <ProductEditForm product={selectedProduct} onCancel={handleCloseModal} />
                                ) : (
                                    <ProductDetails product={selectedProduct} onEdit={() => setIsEditing(true)} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("SellerProducts render error:", error);
        reportError(error);
        return (
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Products</h2>
                <p className="text-gray-400">There was an error loading the products data.</p>
            </div>
        );
    }
}

function ProductEditForm({ product, onCancel }) {
    try {
        const [formData, setFormData] = React.useState({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            status: product.status,
            image: product.image
        });
        const [loading, setLoading] = React.useState(false);
        const { success, error: showError } = useNotification();

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            try {
                setLoading(true);
                // In a real app, this would call an API to update the product
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
                
                success('Product updated successfully');
                onCancel();
            } catch (error) {
                console.error("Failed to update product:", error);
                reportError(error);
                showError('Failed to update product');
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Price ($)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            required
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-32"
                        required
                    ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            required
                        >
                            <option value="text-generation">Text Generation</option>
                            <option value="image-generation">Image Generation</option>
                            <option value="data-analysis">Data Analysis</option>
                            <option value="audio-processing">Audio Processing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            required
                        >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Product Image</label>
                    <div className="flex items-center space-x-4">
                        <img 
                            src={formData.image}
                            alt={formData.name}
                            className="w-24 h-24 rounded-lg object-cover"
                        />
                        <button 
                            type="button"
                            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
                        >
                            Change Image
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                    <button 
                        type="button"
                        className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Saving...
                            </span>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </form>
        );
    } catch (error) {
        console.error("ProductEditForm render error:", error);
        reportError(error);
        return (
            <div className="text-error-light p-4">
                An error occurred while rendering the form.
            </div>
        );
    }
}

function ProductDetails({ product, onEdit }) {
    try {
        const formatCategory = (category) => {
            return category.split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="rounded-lg overflow-hidden mb-4">
                            <img 
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-sm text-gray-400">Price</p>
                                <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-sm text-gray-400">Sales</p>
                                <p className="text-xl font-bold">{product.sales}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-sm text-gray-400">Rating</p>
                                <p className="text-xl font-bold flex items-center">
                                    <i className="fas fa-star text-yellow-500 mr-1"></i>
                                    {product.rating}
                                </p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-sm text-gray-400">Status</p>
                                <p className={`text-xl font-bold ${
                                    product.status === 'active' ? 'text-success-light' : 'text-warning-light'
                                }`}>
                                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm text-gray-400">Name</h3>
                            <p className="text-xl font-bold">{product.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-400">Category</h3>
                            <p>{formatCategory(product.category)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-400">Created</h3>
                            <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-400">Description</h3>
                            <p className="text-gray-300">{product.description}</p>
                        </div>
                    </div>
                </div>
                
                <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold mb-3">Performance</h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Revenue</p>
                                <p className="text-xl font-bold">${(product.sales * product.price).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Conversion Rate</p>
                                <p className="text-xl font-bold">12.5%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Views</p>
                                <p className="text-xl font-bold">{product.sales * 8}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                        onClick={onEdit}
                    >
                        Edit Product
                    </button>
                </div>
            </div>
        );
    } catch (error) {
        console.error("ProductDetails render error:", error);
        reportError(error);
        return (
            <div className="text-error-light p-4">
                An error occurred while displaying product details.
            </div>
        );
    }
}
