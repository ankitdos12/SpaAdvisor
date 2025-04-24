import React, { useState } from 'react';
import {
  AiFillHome,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar
} from 'react-icons/ai';
import { BiSpa } from 'react-icons/bi';
import { FaSpa } from "react-icons/fa6";
import AdminSpaPage from './Pages/AdminSpaPage';
import DashboardContent from './Pages/DashboardContent';
import AddSpa from './Pages/AddSpa';
import { ToastContainer } from 'react-toastify';
import AddServicePage from './pages/AddServicePage';
import { MdAddBusiness } from "react-icons/md";
import BookingsContent from './Pages/BookingsContent';
import { IoMdNotifications } from 'react-icons/io';
import 'react-toastify/dist/ReactToastify.css';

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { icon: AiFillHome, label: 'Dashboard', tab: 'dashboard' },
    { icon: FaSpa, label: 'Add Spa', tab: 'spa' },
    { icon: BiSpa, label: 'All Spa', tab: 'allspa' },
    { icon: AiOutlineCalendar, label: 'Bookings', tab: 'bookings' },
    { icon: AiOutlineUser, label: 'Users', tab: 'users' },
    { icon: MdAddBusiness, label: 'Add Spa Service', tab: 'settings' }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="mt-10">
        {menuItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`w-full flex items-center p-4 hover:bg-gray-800 transition-colors 
              ${activeTab === item.tab ? 'bg-gray-800 text-blue-400' : 'text-gray-300'}`}
          >
            <item.icon className="mr-3 w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// NotificationSidebar Component
const NotificationSidebar = ({ notifications, isOpen, onClose }) => {
  return (
    <div className={`fixed right-0 top-0 h-screen w-80 bg-white shadow-lg transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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

// Header Component
const Header = ({ activeTab, notifications, toggleNotifications }) => {
  return (
    <header className="ml-64 bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-semibold capitalize">{activeTab}</h1>
      <div className="flex items-center">
        <button 
          className="mr-4 relative"
          onClick={toggleNotifications}
        >
          <IoMdNotifications className="w-6 h-6 text-gray-600" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
        <div className="mr-4 flex items-center">
          <img
            src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            alt="Admin"
            className="w-10 h-10 rounded-full mr-2"
          />
          <span className="font-medium">Admin User</span>
        </div>
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center">
          <AiOutlineLogout className="mr-2 w-4 h-4" /> Logout
        </button>
      </div>
    </header>
  );
};

// Users Content Component
const UsersContent = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer' }
  ]);

  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-4">{user.name}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">{user.role}</td>
              <td className="p-4 flex space-x-2">
                <button
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <AiOutlineEdit className="w-5 h-5" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(user.id)}
                  title="Delete"
                >
                  <AiOutlineDelete className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Function to add new notification
  const addNotification = (message) => {
    const newNotification = {
      message,
      time: new Date().toLocaleTimeString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'allspa':
        return <AdminSpaPage />;
      case 'users':
        return <UsersContent />;
      case 'spa':
        return <AddSpa />;
      case 'settings':
        return <AddServicePage />;
      case 'bookings':
        return <BookingsContent addNotification={addNotification} />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ml-5 flex-1">
        <Header 
          activeTab={activeTab} 
          notifications={notifications}
          toggleNotifications={toggleNotifications}
        />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
      <NotificationSidebar 
        notifications={notifications} 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};

export default App;