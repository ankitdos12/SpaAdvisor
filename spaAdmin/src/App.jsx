import React, {useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AddSpaDetails from './Pages/AddSpaDetails';
import GetSpaDetails from './Pages/GetSpaDetails';
import AdminSpaPage from './Pages/AdminSpaPage';
import DashboardContent from './Pages/DashboardContent';
import AddSpa from './Pages/AddSpa';
import { ToastContainer } from 'react-toastify';
import AddServicePage from './Pages/AddServicePage';
import BookingsContent from './Pages/BookingsContent';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Pages/Header';
import UsersContent from './components/UsersContent';
import NotificationSidebar from './components/NotificationSidebar';
import Sidebar from './components/Sidebar';
import LoginPage from './components/admin/LoginPage';
import SignUpPage from './components/admin/SignUpPage';

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

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

  const MainLayout = () => (
    <div className="flex bg-gray-100 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 transition-all duration-300">
        <Header 
          activeTab={activeTab} 
          notifications={notifications}
          toggleNotifications={toggleNotifications}
          toggleSidebar={toggleSidebar}
        />
        <main className="p-3 sm:p-6 lg:ml-64">
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<MainLayout />} />
        <Route path="/" element={<navigate to="/dashboard" replace />} />
        <Route path="/add-spa-details" element={<AddSpaDetails />} />
        <Route path="/get-spas-details" element={<GetSpaDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;