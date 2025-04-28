import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineDelete } from "react-icons/ai";
import { getUsers } from '../api/spaApi';
import { getToken } from "../utils/token";

const UsersContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            console.log("response", response);

            setUsers(response.users);
            setLoading(false);
        } catch (error) {
            setError('Error fetching users: ' + error.message);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/users/${id}`);
            setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            setError('Error deleting user: ' + error.message);
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <>{
            getToken() ? (<div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-left">Name</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Phone</th>
                            <th className="p-4 text-left">Created At</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{`${user.firstName} ${user.lastName}`}</td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">{user.phone}</td>
                                <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="p-5 flex space-x-2">
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete(user._id)}
                                        title="Delete"
                                    >
                                        <AiOutlineDelete className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>) : (
                <div className="flex flex-col items-center justify-center bg-gray-100">
                    <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
                    <p className="text-gray-600">Please log in to view this page.</p>
                </div>
            )
        }</>
    );
};

export default UsersContent;