import React from 'react';
import {
    AiFillHome,
    AiOutlineUser,
    AiOutlineCalendar
} from 'react-icons/ai';
import { BiSpa } from 'react-icons/bi';
import { FaSpa } from "react-icons/fa6";
import { MdAddBusiness, MdEmail } from "react-icons/md";
 
const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
    const menuItems = [
        { icon: AiFillHome, label: 'Dashboard', tab: 'dashboard' },
        { icon: FaSpa, label: 'Add Spa', tab: 'spa' },
        { icon: BiSpa, label: 'All Spa', tab: 'allspa' },
        { icon: AiOutlineCalendar, label: 'Bookings', tab: 'bookings' },
        { icon: AiOutlineUser, label: 'Users', tab: 'users' },
        { icon: MdAddBusiness, label: 'Add Spa Service', tab: 'settings' },
        { icon: AiOutlineUser, label: 'Update Services', tab: 'service' },
        { icon: MdEmail, label: 'Inquiries', tab: 'inquiries' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
            <div className={`
        fixed left-0 top-0 h-screen bg-gray-900 text-white z-30
        transform transition-transform duration-300 ease-in-out
        lg:transform-none lg:w-64
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
      `}>
                <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
                    <span>Admin Panel</span>
                    <button onClick={toggleSidebar} className="lg:hidden">✕</button>
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
        </>
    );
};

export default Sidebar;