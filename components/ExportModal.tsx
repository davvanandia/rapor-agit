'use client';

import { useState } from 'react';
import { FiUser, FiBook, FiCalendar, FiX } from 'react-icons/fi';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: {
    studentName: string;
    schoolName: string;
    academicYear: string;
  }) => void;
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    schoolName: '',
    academicYear: '2023/2024'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold">Export Laporan PDF</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <FiUser className="mr-2" />
                  Nama Siswa
                </div>
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <FiBook className="mr-2" />
                  Nama Sekolah
                </div>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama sekolah"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  Tahun Ajaran
                </div>
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2023/2024">2023/2024</option>
                <option value="2022/2023">2022/2023</option>
                <option value="2021/2022">2021/2022</option>
                <option value="2020/2021">2020/2021</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}