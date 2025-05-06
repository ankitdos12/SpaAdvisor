import React, { useState, useEffect } from 'react';
import { AiOutlineDelete, AiOutlineCopy, AiOutlineCheck } from "react-icons/ai";
import { getUsers, deleteUser } from '../api/spaApi';
import { getToken } from "../utils/token";
 import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UsersContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedIds, setCopiedIds] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentUserRole, setCurrentUserRole] = useState(null);

    useEffect(() => {
        fetchUsers();
        // Get current user role from JWT token or user data
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log("userData", userData);
        
        setCurrentUserRole(userData?.role);
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers(getToken());
            console.log("response", response);
            setUsers(response.data.users);
            setLoading(false);
        } catch (error) {
            toast.error('Error fetching users: ' + error.message);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            if (!currentUserRole || currentUserRole !== 'superadmin') {
                toast.error('Only super admin can delete user accounts');
                return;
            }

            if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                return;
            }

            if (!id) throw new Error('User ID is required');
            setLoading(true);
            await deleteUser(id, getToken());
            await fetchUsers();
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Delete user error:', error);
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(`Error deleting user: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedIds(prev => ({ ...prev, [id]: true }));
        toast.success('ID copied to clipboard');
        setTimeout(() => {
            setCopiedIds(prev => ({ ...prev, [id]: false }));
        }, 2000);
    };

    const exportToExcel = () => {
        const exportData = filteredUsers.map(user => ({
            'Username': user.username,
            'Email': user.email,
            'Phone': user.phoneNumber,
            'Role': user.role,
            'ID': user._id,
            'Last Login': new Date(user.lastLogin).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, 'users_list.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ['Username', 'Email', 'Phone', 'Role', 'Last Login'];
        const tableRows = filteredUsers.map(user => [
            user.username,
            user.email,
            user.phoneNumber,
            user.role,
            new Date(user.lastLogin).toLocaleDateString()
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 }
        });

        doc.save('users_list.pdf');
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user._id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roles = ['all', 'admin', 'superadmin', 'user'];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <>{
            getToken() ? (
                <div className="bg-gray-50 shadow-lg rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={exportToExcel}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Export Excel
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search by username, email or ID..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>
                                        {role === 'all' ? 'All Roles' :
                                            role === 'superadmin' ? 'Super Admin' :
                                                role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Desktop Table View (hidden on mobile) */}
                    <div className="hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-semibold">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <div className="text-sm text-gray-500">{user._id}</div>
                                                    <button
                                                        onClick={() => copyToClipboard(user._id)}
                                                        className={`transition-colors ${copiedIds[user._id] ? 'text-green-500' : 'text-gray-400 hover:text-blue-600'}`}
                                                        title={copiedIds[user._id] ? "Copied!" : "Copy ID"}
                                                    >
                                                        {copiedIds[user._id] ? (
                                                            <AiOutlineCheck className="w-4 h-4" />
                                                        ) : (
                                                            <AiOutlineCopy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.lastLogin).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {currentUserRole === 'superadmin' && (
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full"
                                                        onClick={() => handleDelete(user._id)}
                                                    >
                                                        <AiOutlineDelete className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    No users found matching your search criteria.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Card View (hidden on desktop) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredUsers.map((user) => (
                            <div key={user._id}
                                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-lg">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{user.username}</h3>
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    {currentUserRole === 'superadmin' && (
                                        <button
                                            className="p-2 hover:bg-red-50 rounded-full"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            <AiOutlineDelete className="w-5 h-5 text-red-500" />
                                        </button>
                                    )}
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center space-x-2 text-gray-500">
                                        <span>ID: {user._id}</span>
                                        <button
                                            onClick={() => copyToClipboard(user._id)}
                                            className={`transition-colors ${copiedIds[user._id] ? 'text-green-500' : 'text-gray-400 hover:text-blue-600'}`}
                                            title={copiedIds[user._id] ? "Copied!" : "Copy ID"}
                                        >
                                            {copiedIds[user._id] ? (
                                                <AiOutlineCheck className="w-4 h-4" />
                                            ) : (
                                                <AiOutlineCopy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-gray-600">{user.email}</p>
                                    <p className="text-gray-600">{user.phoneNumber}</p>
                                    <p className="text-gray-500">
                                        Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No users found matching your search criteria.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center bg-gray-50 p-8 rounded-xl shadow-lg">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h1>
                    <p className="text-gray-600">Please log in to view this page.</p>
                </div>
            )
        }</>
    );
};

export default UsersContent;
