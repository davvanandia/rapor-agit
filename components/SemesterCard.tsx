'use client';

import { SemesterData } from '@/types';
import { useRouter } from 'next/navigation';
import { FiBook, FiEdit2 } from 'react-icons/fi';

interface SemesterCardProps {
  semester: SemesterData;
  index: number;
  onUpdate: () => void;
}

export default function SemesterCard({ semester }: SemesterCardProps) {
  const router = useRouter();

  const getClassLabel = (id: number) => {
    if (id <= 2) return { class: 'Kelas 10', color: 'bg-blue-50 border-blue-200' };
    if (id <= 4) return { class: 'Kelas 11', color: 'bg-purple-50 border-purple-200' };
    return { class: 'Kelas 12', color: 'bg-amber-50 border-amber-200' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-amber-600';
    if (score >= 65) return 'text-orange-600';
    return 'text-red-600';
  };

  const label = getClassLabel(semester.id);

  return (
    <div 
      onClick={() => router.push(`/semester/${semester.id}`)}
      className="card cursor-pointer hover:border-gray-300 transition-colors"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-2">
              <div className={`w-10 h-10 rounded-md ${label.color} border flex items-center justify-center mr-3`}>
                <span className="font-bold text-gray-800">{semester.id}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Semester {semester.id}</h3>
                <p className="text-sm text-gray-500">{label.class}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <FiBook className="mr-1" size={14} />
            {semester.subjects.length}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">Rata-rata</span>
              <span className={`font-bold ${getScoreColor(semester.average)}`}>
                {semester.average > 0 ? semester.average.toFixed(2) : '--'}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min(semester.average, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Skor</span>
            <span className="font-semibold text-gray-900">
              {semester.totalScore > 0 ? semester.totalScore.toLocaleString('id-ID') : '--'}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/semester/${semester.id}`);
          }}
          className={`w-full mt-4 py-2 px-4 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors ${
            semester.subjects.length > 0
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
              : 'btn-primary'
          }`}
        >
          <FiEdit2 size={16} />
          <span>
            {semester.subjects.length > 0 ? 'Edit Data' : 'Input Nilai'}
          </span>
        </button>
      </div>
    </div>
  );
}