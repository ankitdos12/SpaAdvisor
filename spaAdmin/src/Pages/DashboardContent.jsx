import { useEffect, useState } from 'react';
import {
    AiFillHome,
    AiOutlineUser,
    AiOutlineShop,
    AiOutlineLogin,
} from 'react-icons/ai';
import { getSpas } from '../api/spaApi';

const DashboardContent = () => {
    const [spas, setSpas] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getSpas();
                setSpas(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    },[]);
    const stats = [
        {
            label: 'Total Users',
            value: '1,234',
            icon: AiOutlineUser,
            color: 'blue'
        },
        {
            label: 'Logged In Users',
            value: '328',
            icon: AiOutlineLogin,
            color: 'green'
        },
        {
            label: 'Total Spas',
            value: spas?.length?.toString() || '0',
            icon: AiOutlineShop,
            color: 'red'
        },
        {
            label: 'Active Projects',
            value: '42',
            icon: AiFillHome,
            color: 'purple'
        }
    ];

    return (
        <div className="p-4 sm:ml-64 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`bg-white shadow-md rounded-lg p-4 sm:p-6 border-l-4 border-${stat.color}-500 flex items-center hover:shadow-lg transition-shadow duration-300`}
                    >
                        <div className={`p-2 sm:p-3 rounded-full bg-${stat.color}-100 mr-3 sm:mr-4`}>
                            <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-500`} />
                        </div>
                        <div>
                            <h3 className="text-gray-500 text-xs sm:text-sm">{stat.label}</h3>
                            <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardContent;