function Loader({ size = 'md', color = 'primary', className = '' }) {
    try {
        const sizeStyles = {
            sm: "w-4 h-4 border-2",
            md: "w-6 h-6 border-2",
            lg: "w-8 h-8 border-3",
            xl: "w-12 h-12 border-4"
        };
        
        const colorStyles = {
            primary: "border-primary-main border-t-transparent",
            white: "border-white border-t-transparent",
            gray: "border-gray-400 border-t-transparent"
        };
        
        return (
            <div 
                className={`rounded-full animate-spin ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
                data-name="loader"
            ></div>
        );
    } catch (error) {
        console.error("Loader render error:", error);
        reportError(error);
        return null;
    }
}
