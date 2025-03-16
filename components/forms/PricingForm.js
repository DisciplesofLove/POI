function PricingForm({ modelData, handleChange }) {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Pricing & Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Purchase Price (MATIC)</label>
                    <input
                        type="number"
                        name="price"
                        value={modelData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="0.00"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Listing Type</label>
                    <select
                        name="type"
                        value={modelData.type}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    >
                        <option value="sale">For Sale</option>
                        <option value="lease">For Lease</option>
                        <option value="both">Both Sale & Lease</option>
                    </select>
                </div>

                {(modelData.type === 'lease' || modelData.type === 'both') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Lease Price (MATIC/month)</label>
                            <input
                                type="number"
                                name="leasePrice"
                                value={modelData.leasePrice}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Lease Duration (days)</label>
                            <select
                                name="leaseDuration"
                                value={modelData.leaseDuration}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="180">180 days</option>
                                <option value="365">365 days</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">License Type</label>
                <select
                    name="license"
                    value={modelData.license}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                >
                    <option value="standard">Standard License</option>
                    <option value="commercial">Commercial License</option>
                    <option value="enterprise">Enterprise License</option>
                    <option value="academic">Academic License</option>
                </select>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Terms of Service</label>
                <textarea
                    name="termsOfService"
                    value={modelData.termsOfService}
                    onChange={handleChange}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="Specify your terms of service..."
                ></textarea>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Privacy Policy</label>
                <textarea
                    name="privacyPolicy"
                    value={modelData.privacyPolicy}
                    onChange={handleChange}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="Specify your privacy policy..."
                ></textarea>
            </div>
        </div>
    );
}
