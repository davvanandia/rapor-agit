'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredData } from '@/lib/storage';
import { ChartData, SemesterData } from '@/types';
import ResultsChart from '@/components/ResultsChart';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiActivity, FiAward } from 'react-icons/fi';

export default function ResultsPage() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalScore: 0,
    average: 0,
    completedSemesters: 0,
    bestSemester: 0,
    worstSemester: 0
  });

  useEffect(() => {
    const data = getStoredData();
    setSemesters(data);
    
    const validSemesters = data.filter(s => s.subjects.length > 0);
    
    if (validSemesters.length === 0) {
      router.push('/');
      return;
    }

    // Hitung statistik keseluruhan
    const totalScore = validSemesters.reduce((sum, sem) => sum + sem.totalScore, 0);
    const totalAverage = validSemesters.reduce((sum, sem) => sum + sem.average, 0);
    const average = Number((totalAverage / validSemesters.length).toFixed(2));

    // Cari semester terbaik dan terburuk
    const averages = validSemesters.map(sem => sem.average);
    const bestAvg = Math.max(...averages);
    const worstAvg = Math.min(...averages);
    const bestSemester = validSemesters.find(sem => sem.average === bestAvg)?.id || 0;
    const worstSemester = validSemesters.find(sem => sem.average === worstAvg)?.id || 0;

    setOverallStats({
      totalScore,
      average,
      completedSemesters: validSemesters.length,
      bestSemester,
      worstSemester
    });

    // Siapkan data untuk chart
    const subjectsMap = new Map<string, number[]>();
    
    validSemesters.forEach((semester, semIndex) => {
      semester.subjects.forEach(subject => {
        if (!subjectsMap.has(subject.name)) {
          subjectsMap.set(subject.name, Array(5).fill(0));
        }
        const scores = subjectsMap.get(subject.name)!;
        scores[semIndex] = subject.score;
      });
    });

    const chartDataArray: ChartData[] = Array.from(subjectsMap.entries()).map(([subject, scores]) => ({
      subject,
      semester1: scores[0],
      semester2: scores[1],
      semester3: scores[2],
      semester4: scores[3],
      semester5: scores[4]
    }));

    setChartData(chartDataArray);
  }, [router]);

  const getPerformanceTrend = () => {
    const averages = semesters.filter(s => s.subjects.length > 0).map(s => s.average);
    if (averages.length < 2) return { text: 'Stabil', color: 'text-gray-600', icon: '→' };
    
    const last = averages[averages.length - 1];
    const first = averages[0];
    const diff = last - first;
    
    if (diff > 5) return { text: 'Meningkat Signifikan', color: 'text-green-600', icon: '📈' };
    if (diff > 2) return { text: 'Meningkat', color: 'text-green-500', icon: '↑' };
    if (diff < -5) return { text: 'Menurun Signifikan', color: 'text-red-600', icon: '📉' };
    if (diff < -2) return { text: 'Menurun Sedikit', color: 'text-red-500', icon: '↓' };
    return { text: 'Stabil', color: 'text-gray-600', icon: '→' };
  };

  const trend = getPerformanceTrend();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <FiArrowLeft className="mr-2" />
                Kembali ke Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Analisis Lengkap Nilai</h1>
              <p className="text-gray-600">Grafik dan statistik dari semua semester</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                <FiActivity className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Skor</p>
                <p className="text-xl font-bold text-gray-900">
                  {overallStats.totalScore.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center mr-3">
                <FiTrendingUp className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rata-rata Keseluruhan</p>
                <p className="text-xl font-bold text-gray-900">
                  {overallStats.average.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                <FiAward className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tren Prestasi</p>
                <p className="text-lg font-bold text-gray-900 flex items-center">
                  {trend.icon} <span className={`ml-2 ${trend.color}`}>{trend.text}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-md flex items-center justify-center mr-3">
                <FiTrendingDown className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Semester Terisi</p>
                <p className="text-xl font-bold text-gray-900">
                  {overallStats.completedSemesters}/5
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Grafik Perkembangan Nilai</h2>
          <p className="text-gray-600 mb-6">
            Perkembangan nilai setiap mata pelajaran dari semester 1-5
          </p>
          <ResultsChart data={chartData} />
        </div>

        {/* Semester Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Detail per Semester</h2>
          <div className="space-y-4">
            {semesters.filter(s => s.subjects.length > 0).map((semester) => (
              <div key={semester.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Semester {semester.id}</h3>
                    <p className="text-sm text-gray-500">
                      {semester.id <= 2 ? 'Kelas 10' : semester.id <= 4 ? 'Kelas 11' : 'Kelas 12'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Rata-rata</p>
                      <p className="font-bold text-gray-900">{semester.average.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Skor</p>
                      <p className="font-bold text-gray-900">{semester.totalScore.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {semester.subjects.map((subject) => (
                    <div key={subject.id} className="bg-gray-50 border border-gray-200 rounded p-2">
                      <p className="text-xs text-gray-600 truncate mb-1">{subject.name}</p>
                      <p className={`text-center font-bold ${
                        subject.score >= 85 ? 'text-green-600' :
                        subject.score >= 75 ? 'text-amber-600' :
                        subject.score >= 65 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {subject.score}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Analisis dan Rekomendasi</h2>
          <div className="space-y-4">
            {overallStats.average >= 85 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🎉 Prestasi Sangat Baik!</h4>
                <p className="text-green-700">
                  Rata-rata nilai Anda sangat baik. Pertahankan konsistensi belajar dan fokus pada
                  pengembangan di bidang yang Anda minati.
                </p>
              </div>
            ) : overallStats.average >= 75 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">👍 Prestasi Baik</h4>
                <p className="text-amber-700">
                  Prestasi akademik Anda baik. Coba tingkatkan mata pelajaran yang masih di bawah rata-rata
                  untuk mencapai hasil yang lebih optimal.
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">💪 Perlu Peningkatan</h4>
                <p className="text-orange-700">
                  Perlu fokus lebih pada mata pelajaran dengan nilai terendah. Identifikasi kesulitan
                  belajar dan cari strategi yang lebih efektif.
                </p>
              </div>
            )}
            
            {overallStats.bestSemester > 0 && overallStats.worstSemester > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Performa Terbaik dan Terendah</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Semester Terbaik</p>
                    <p className="font-bold text-blue-800">Semester {overallStats.bestSemester}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Semester Perlu Perbaikan</p>
                    <p className="font-bold text-blue-800">Semester {overallStats.worstSemester}</p>
                  </div>
                </div>
              </div>
            )}
            
            {chartData.some(d => 
              (d.semester5 || d.semester4 || d.semester3 || d.semester2 || d.semester1) < 70
            ) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Perhatian Khusus</h4>
                <p className="text-red-700">
                  Beberapa mata pelajaran memiliki nilai di bawah 70. Perlu perhatian khusus untuk
                  meningkatkan pemahaman pada materi tersebut.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}