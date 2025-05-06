import React, { useState, useEffect } from 'react';
import { getInquiry } from '../api/spaApi';
import { getToken } from '../utils/token';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InquiryContent = () => {
  const [inquiries, setInquiries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await getInquiry(getToken());
        console.log(response);

        if (response.status === 'success' && response.data) {
          setInquiries(response.data);
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };
    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inquiry.phone.toString().includes(searchQuery)
  );

  const exportToExcel = () => {
    const exportData = filteredInquiries.map(inquiry => ({
      'Name': inquiry.name,
      'Phone': inquiry.phone
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inquiries');
    XLSX.writeFile(wb, 'inquiries_list.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Name', 'Phone'];
    const tableRows = filteredInquiries.map(inquiry => [
      inquiry.name,
      inquiry.phone
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    doc.save('inquiries_list.pdf');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Inquiries Management
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({inquiries.length} total)
            </span>
          </h2>
          <div className="mt-2 flex gap-2">
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
        <div className="relative">
          <input
            type="text"
            placeholder="Search inquiries..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInquiries.map((inquiry, index) => (
              <tr
                key={inquiry._id || index}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{inquiry.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100 transition-colors duration-200">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InquiryContent;
