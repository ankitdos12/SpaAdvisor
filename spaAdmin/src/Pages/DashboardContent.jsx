import { useEffect, useState } from 'react';
import { AiOutlineUser, AiOutlineShop, AiOutlineLogin, AiOutlinePlus, AiOutlineUnorderedList } from 'react-icons/ai';
import { Link, Navigate } from 'react-router-dom';
import { getSpas, getTotalLogedInUsers, getAllUsers } from '../api/spaApi';
import { getToken } from '../utils/token';

const DashboardContent = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [spasRes, loginRes, usersRes] = await Promise.all([
                    getSpas(),
                    getTotalLogedInUsers(),
                    getAllUsers()
                ]);

                console.log("loginRes", loginRes);


                setStats([
                    {
                        label: 'Total Users',
                        value: usersRes.totalUsers || '0',
                        icon: AiOutlineUser,
                        colorClasses: 'border-blue-500 bg-blue-100 text-blue-500'
                    },
                    {
                        label: 'Logged In Users',
                        value: loginRes.totalCurrentlyLoggedIn || '0',
                        icon: AiOutlineLogin,
                        colorClasses: 'border-green-500 bg-green-100 text-green-500'
                    },
                    {
                        label: 'Total Spas',
                        value: spasRes?.length?.toString() || '0',
                        icon: AiOutlineShop,
                        colorClasses: 'border-red-500 bg-red-100 text-red-500'
                    }
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const navigationCards = [
        {
            label: 'Add Spa Details',
            icon: AiOutlinePlus,
            path: '/add-spa-details',
            colorClasses: 'border-purple-500 bg-purple-100 text-purple-500'
        },
        {
            label: 'View Spas Details',
            icon: AiOutlineUnorderedList,
            path: '/get-spas-details',
            colorClasses: 'border-yellow-500 bg-yellow-100 text-yellow-500'
        }
    ];

    return (
        <>
            {getToken() ? (
                <div className="p-4 sm:ml-64 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className={`bg-white shadow-md rounded-lg p-4 sm:p-6 border-l-4 border-${stat.colorClasses.split(' ')[0]} flex items-center hover:shadow-lg transition-shadow duration-300`}
                            >
                                <div className={`p-2 sm:p-3 rounded-full ${stat.colorClasses.split(' ')[1]} mr-3 sm:mr-4`}>
                                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.colorClasses.split(' ')[2]}`} />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 text-xs sm:text-sm">{stat.label}</h3>
                                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {navigationCards.map((card) => (
                            <Link
                                key={card.label}
                                to={card.path}
                                className={`bg-white shadow-md rounded-lg p-4 sm:p-6 border-l-4 border-${card.colorClasses.split(' ')[0]} flex items-center hover:shadow-lg transition-shadow duration-300`}
                            >
                                <div className={`p-2 sm:p-3 rounded-full ${card.colorClasses.split(' ')[1]} mr-3 sm:mr-4`}>
                                    <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.colorClasses.split(' ')[2]}`} />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 text-sm">{card.label}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <Navigate to="/login" replace />
            )}
        </>
    );
};

export default DashboardContent;