function SearchBar({ onSearch }) {
    return (
        <div className="search-bar rounded-lg p-2 max-w-2xl mx-auto" data-name="search-bar">
            <div className="flex items-center">
                <i className="fas fa-search text-gray-400 mx-3"></i>
                <input
                    type="text"
                    placeholder="Search AI models..."
                    className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400"
                    onChange={(e) => onSearch(e.target.value)}
                    data-name="search-input"
                />
            </div>
        </div>
    );
}
