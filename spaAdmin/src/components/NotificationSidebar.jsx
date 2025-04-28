
const NotificationSidebar = ({ notifications, isOpen, onClose }) => {
    return (
        <div className={`
      fixed right-0 top-0 h-screen bg-white shadow-lg z-40
      transform transition-transform duration-300
      w-full sm:w-80
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>
            <div className="overflow-y-auto h-full pb-20">
                {notifications.map((notification, index) => (
                    <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <p className="text-sm text-gray-800">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationSidebar;