function Button({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    loading = false, 
    disabled = false, 
    type = 'button',
    onClick,
    className = '',
    ...props 
}) {
    try {
        const baseStyles = "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-dark";
        
        const variantStyles = {
            primary: "bg-primary-main hover:bg-primary-dark text-white focus:ring-primary-main",
            secondary: "bg-white/10 hover:bg-white/20 text-white focus:ring-white/20",
            danger: "bg-error-main hover:bg-error-dark text-white focus:ring-error-main",
            success: "bg-success-main hover:bg-success-dark text-white focus:ring-success-main"
        };
        
        const sizeStyles = {
            sm: "text-sm px-3 py-1.5",
            md: "px-4 py-2",
            lg: "text-lg px-6 py-3"
        };
        
        const widthStyles = fullWidth ? "w-full" : "";
        
        const disabledStyles = (disabled || loading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
        
        return (
            <button
                type={type}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className}`}
                onClick={onClick}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {children}
                    </div>
                ) : children}
            </button>
        );
    } catch (error) {
        console.error("Button render error:", error);
        reportError(error);
        return <button className="bg-error-main text-white px-4 py-2 rounded-lg">Error</button>;
    }
}
