function CategoryFilter({ selectedCategory, onSelectCategory }) {
    const categories = [
        "All", "Text Generation", "Image Generation", "Audio Processing",
        "Video Processing", "Data Analysis", "Natural Language"
    ];

    return (
        <div className="category-filter flex flex-wrap gap-2 justify-center my-8" data-name="category-filter">
            {categories.map(category => (
                <button
                    key={category}
                    className={`px-4 py-2 rounded-full ${
                        selectedCategory === category 
                        ? 'active' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => onSelectCategory(category)}
                    data-name={`category-${category.toLowerCase().replace(' ', '-')}`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
