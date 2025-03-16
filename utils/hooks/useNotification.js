function useNotification() {
    const [notifications, setNotifications] = React.useState([]);
    
    const addNotification = (notification) => {
        const id = Date.now().toString();
        setNotifications(prev => [
            ...prev,
            {
                id,
                ...notification,
                timestamp: new Date()
            }
        ]);
        
        // Auto-remove after timeout
        setTimeout(() => {
            removeNotification(id);
        }, notification.duration || 5000);
        
        return id;
    };
    
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    const success = (message, options = {}) => {
        return addNotification({
            type: 'success',
            message,
            ...options
        });
    };
    
    const error = (message, options = {}) => {
        return addNotification({
            type: 'error',
            message,
            ...options
        });
    };
    
    const warning = (message, options = {}) => {
        return addNotification({
            type: 'warning',
            message,
            ...options
        });
    };
    
    const info = (message, options = {}) => {
        return addNotification({
            type: 'info',
            message,
            ...options
        });
    };
    
    // Notification Component
    const NotificationContainer = () => {
        if (notifications.length === 0) return null;
        
        return (
            <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-lg shadow-lg flex items-center justify-between max-w-sm ${
                            notification.type === 'success' ? 'bg-success-main text-white' :
                            notification.type === 'error' ? 'bg-error-main text-white' :
                            notification.type === 'warning' ? 'bg-warning-main text-black' :
                            'bg-info-main text-white'
                        }`}
                    >
                        <div className="flex items-center">
                            <i className={`mr-3 fas ${
                                notification.type === 'success' ? 'fa-check-circle' :
                                notification.type === 'error' ? 'fa-exclamation-circle' :
                                notification.type === 'warning' ? 'fa-exclamation-triangle' :
                                'fa-info-circle'
                            }`}></i>
                            <span>{notification.message}</span>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-4 text-sm opacity-70 hover:opacity-100"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>
        );
    };
    
    return {
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
        NotificationContainer
    };
}
