import { AiOutlineLogout } from "react-icons/ai";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { getToken, removeToken } from "../utils/token";

const Header = ({ activeTab, notifications, toggleNotifications, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        if (getToken()) {
            removeToken();
            navigate('/login');
        } else {
            navigate('/login');
        }
    };

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center
      lg:ml-64 transition-all duration-300">
            <div className="flex items-center">
                <button
                    className="lg:hidden mr-4 text-gray-600"
                    onClick={toggleSidebar}
                >
                    ☰
                </button>
                <h1 className="text-xl sm:text-2xl font-semibold capitalize">{activeTab}</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button className="relative" onClick={toggleNotifications}>
                    <IoMdNotifications className="w-6 h-6 text-gray-600" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                            {notifications.length}
                        </span>
                    )}
                </button>
                <div className="hidden sm:flex items-center">
                    <img
                        src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
                        alt="Admin"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2"
                    />
                    <span className="font-medium">Admin</span>
                </div>
                <button 
                    onClick={handleLoginClick}
                    className="bg-red-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded hover:bg-red-600 flex items-center"
                >
                    <AiOutlineLogout className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">{getToken() ? "Logout" : "Login"}</span>
                </button>
            </div>
        </header>
    );
};

export default Header;