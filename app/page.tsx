'use client';

import { useState, useEffect } from 'react';
import SemesterCard from '@/components/SemesterCard';
import { getStoredData, clearAllData } from '@/lib/storage';
import { SemesterData } from '@/types';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { FiBarChart2, FiTrendingUp, FiBook, FiCheckCircle } from 'react-icons/fi';

export default function Home() {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [overallAverage, setOverallAverage] = useState<number>(0);
  const [totalOverallScore, setTotalOverallScore] = useState<number>(0);
  const [completedSemesters, setCompletedSemesters] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
    setTimeout(() => setLoading(false), 500);
  }, []);

  const loadData = () => {
    const data = getStoredData();
    setSemesters(data);
    calculateOverallStats(data);
  };

  const calculateOverallStats = (data: SemesterData[]) => {
    const validSemesters = data.filter(s => s.subjects.length > 0);
    setCompletedSemesters(validSemesters.length);
    
    if (validSemesters.length === 0) {
      setOverallAverage(0);
      setTotalOverallScore(0);
      return;
    }

    const totalAverage = validSemesters.reduce((sum, sem) => sum + sem.average, 0);
    const totalScore = validSemesters.reduce((sum, sem) => sum + sem.totalScore, 0);
    
    setOverallAverage(Number((totalAverage / validSemesters.length).toFixed(2)));
    setTotalOverallScore(totalScore);
  };

  const handleClearAll = async () => {
    const result = await Swal.fire({
      title: 'Reset Semua Data?',
      text: 'Semua data semester akan dihapus dan tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Reset Semua',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#374151',
      customClass: {
        popup: 'rounded-lg border border-gray-200',
        confirmButton: 'px-4 py-2 rounded-md',
        cancelButton: 'px-4 py-2 rounded-md'
      }
    });

    if (result.isConfirmed) {
      clearAllData();
      setSemesters(Array(5).fill(null).map((_, i) => ({
        id: i + 1,
        subjects: [],
        totalScore: 0,
        average: 0,
        subjectCount: 0
      })));
      setOverallAverage(0);
      setTotalOverallScore(0);
      setCompletedSemesters(0);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Semua data telah direset.',
        icon: 'success',
        background: '#ffffff',
        color: '#374151',
        customClass: {
          popup: 'rounded-lg border border-gray-200'
        }
      });
    }
  };

  const allCompleted = semesters.every(s => s.subjects.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header & Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="lg:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Rapor Agit - Hitung Rata-Rata Rapor
              </h1>
              <p className="text-gray-600 mb-6 max-w-3xl">
                Hitung dan analisis rata-rata nilai rapor dari semester 1-5 dengan mudah.
                Pantau perkembangan akademik secara visual dan terstruktur.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/semester/1')}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiBook className="mr-2" />
                  Mulai Input Nilai
                </button>
                
                {allCompleted && (
                  <button
                    onClick={() => router.push('/results')}
                    className="px-6 py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center"
                  >
                    <FiBarChart2 className="mr-2" />
                    Lihat Analisis Lengkap
                  </button>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 lg:w-1/3">
              <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Akademik</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Rata-rata Keseluruhan</span>
                    <span className="font-bold text-gray-900">{overallAverage.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(overallAverage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Total Skor</span>
                    <span className="font-bold text-gray-900">{totalOverallScore.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-gray-500">Jumlah semua nilai</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Semester Terisi</span>
                    <span className="font-bold text-gray-900">{completedSemesters}/5</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        className={`flex-1 h-2 rounded-sm ${
                          num <= completedSemesters ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Semester (1-5)</h2>
          <p className="text-gray-600">Klik pada semester untuk input atau edit data nilai</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {semesters.map((semester, index) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              index={index}
              onUpdate={loadData}
            />
          ))}
        </div>
      </div>

      {/* Info & Features */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mb-4">
              <FiCheckCircle className="text-blue-600" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Input Mudah</h4>
            <p className="text-gray-600 text-sm">
              Input nilai mata pelajaran per semester dengan antarmuka yang sederhana dan intuitif.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center mb-4">
              <FiTrendingUp className="text-green-600" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Analisis Visual</h4>
            <p className="text-gray-600 text-sm">
              Lihat perkembangan nilai dalam bentuk grafik yang mudah dipahami dan dianalisis.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center mb-4">
              <FiBarChart2 className="text-purple-600" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Data Terstruktur</h4>
            <p className="text-gray-600 text-sm">
              Semua data tersimpan dengan rapi dan bisa diedit kapan saja. Konsisten untuk trend analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {completedSemesters > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  Siap melihat analisis lengkap?
                </h3>
                <p className="text-gray-600">
                  Lihat grafik perkembangan, analisis trend, dan rekomendasi berdasarkan data akademik Anda.
                </p>
              </div>
              <button
                onClick={() => router.push('/results')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Lihat Hasil Lengkap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Warning */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Perhatian</h4>
              <p className="text-gray-600 text-sm">
                Semua data disimpan di browser Anda. Data tidak akan hilang kecuali browser direset.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 border border-red-300 text-red-700 font-medium rounded-md hover:bg-red-50 transition-colors whitespace-nowrap text-sm"
            >
              Reset Semua Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}