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
        <div className="ml-64 grid md:grid-cols-3 gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`bg-white shadow-md rounded-lg p-6 border-l-4 border-${stat.color}-500 flex items-center`}
                >
                    <div className={`p-3 rounded-full bg-${stat.color}-100 mr-4`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm">{stat.label}</h3>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardContent;