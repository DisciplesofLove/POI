import React from 'react';

export default function ModelListFilters({ filters, setFilters }) {
    const categories = ['All', 'Image', 'Text', 'Audio', 'Video'];
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'usage', label: 'Most Used' },
        { value: 'revenue', label: 'Highest Revenue' }
    ];

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        id="category"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="p-2 border rounded"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat === 'All' ? '' : cat.toLowerCase()}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                    </label>
                    <select
                        id="sort"
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="p-2 border rounded"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div>
                    <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Price (JOY)
                    </label>
                    <input
                        type="number"
                        id="priceRange"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        min="0"
                        step="0.1"
                        className="p-2 border rounded w-32"
                    />
                </div>

                <div>
                    <label htmlFor="activeOnly" className="flex items-center gap-2 mt-6">
                        <input
                            type="checkbox"
                            id="activeOnly"
                            checked={filters.activeOnly}
                            onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })}
                            className="rounded text-primary-main"
                        />
                        <span className="text-sm text-gray-700">Active Only</span>
                    </label>
                </div>
            </div>
        </div>
    );
}