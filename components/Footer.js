function Footer() {
    return (
        <footer className="mt-20 py-10 border-t border-white/10" data-name="footer">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4" data-name="footer-about">
                        <h3 className="text-xl font-bold gradient-text">JoyNet</h3>
                        <p className="text-gray-400">
                            The decentralized marketplace for AI models, datasets, and services.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-twitter text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-github text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-discord text-xl"></i>
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4" data-name="footer-marketplace">
                        <h4 className="text-lg font-semibold">Marketplace</h4>
                        <ul className="space-y-2">
                            <li><a href="/browse/models" className="text-gray-400 hover:text-white">AI Models</a></li>
                            <li><a href="/browse/datasets" className="text-gray-400 hover:text-white">Datasets</a></li>
                            <li><a href="/browse/services" className="text-gray-400 hover:text-white">Services</a></li>
                            <li><a href="/browse/algorithms" className="text-gray-400 hover:text-white">Algorithms</a></li>
                            <li><a href="/create-store" className="text-gray-400 hover:text-white">Open a Store</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4" data-name="footer-resources">
                        <h4 className="text-lg font-semibold">Resources</h4>
                        <ul className="space-y-2">
                            <li><a href="/docs" className="text-gray-400 hover:text-white">Documentation</a></li>
                            <li><a href="/api" className="text-gray-400 hover:text-white">API Reference</a></li>
                            <li><a href="/guides" className="text-gray-400 hover:text-white">Guides</a></li>
                            <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
                            <li><a href="/community" className="text-gray-400 hover:text-white">Community</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4" data-name="footer-support">
                        <h4 className="text-lg font-semibold">Support</h4>
                        <ul className="space-y-2">
                            <li><a href="/help" className="text-gray-400 hover:text-white">Help Center</a></li>
                            <li><a href="/contact" className="text-gray-400 hover:text-white">Contact Us</a></li>
                            <li><a href="/terms" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                            <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                            <li><a href="/trust" className="text-gray-400 hover:text-white">Trust & Safety</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} JoyNet. All rights reserved.
                        </p>
                        <div className="mt-4 md:mt-0 flex space-x-6">
                            <a href="/cookies" className="text-gray-400 hover:text-white text-sm">
                                Cookie Settings
                            </a>
                            <a href="/accessibility" className="text-gray-400 hover:text-white text-sm">
                                Accessibility
                            </a>
                            <a href="/sitemap" className="text-gray-400 hover:text-white text-sm">
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
