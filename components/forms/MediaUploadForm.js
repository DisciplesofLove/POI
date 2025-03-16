function MediaUploadForm({ previewImage, setPreviewImage, previewVideo, setPreviewVideo, modelData, setModelData }) {
    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleVideoChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewVideo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Media & Files</h2>
            
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Preview Image</label>
                <div className="flex items-center space-x-4">
                    {previewImage ? (
                        <div className="relative w-32 h-32">
                            <img 
                                src={previewImage}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-1 right-1 bg-error-main/80 hover:bg-error-main text-white p-1 rounded-full"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                            <label className="cursor-pointer text-center p-4">
                                <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                                <p className="text-sm">Upload Image</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Preview Video</label>
                <div className="flex items-center space-x-4">
                    {previewVideo ? (
                        <div className="relative w-64">
                            <video 
                                src={previewVideo}
                                controls
                                className="w-full rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setPreviewVideo(null)}
                                className="absolute top-1 right-1 bg-error-main/80 hover:bg-error-main text-white p-1 rounded-full"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="w-64 h-36 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                            <label className="cursor-pointer text-center p-4">
                                <i className="fas fa-video text-2xl mb-2"></i>
                                <p className="text-sm">Upload Video</p>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Model Files</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6">
                    <div className="text-center">
                        <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
                        <p className="mb-2">Drag and drop your model files here</p>
                        <p className="text-sm text-gray-400 mb-4">or</p>
                        <label className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg cursor-pointer">
                            Browse Files
                            <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    setModelData(prev => ({
                                        ...prev,
                                        files: [...prev.files, ...Array.from(e.target.files)]
                                    }));
                                }}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {modelData.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {modelData.files.map((file, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-between bg-white/5 p-2 rounded-lg"
                                >
                                    <span className="text-sm truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModelData(prev => ({
                                                ...prev,
                                                files: prev.files.filter((_, i) => i !== index)
                                            }));
                                        }}
                                        className="text-error-light hover:text-error-main"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
