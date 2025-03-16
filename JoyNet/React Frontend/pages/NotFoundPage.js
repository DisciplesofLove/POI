function NotFoundPage() {
    return (
        <div className="min-h-screen pt-20 pb-12 flex items-center" data-name="not-found">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-lg mx-auto">
                    <h1 className="text-9xl font-bold gradient-text mb-8">404</h1>
                    <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                    <p className="text-gray-400 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <a 
                        href="/"
                        className="inline-block bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
