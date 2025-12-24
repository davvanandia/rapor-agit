'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredData } from '@/lib/storage';
import { ChartData, SemesterData } from '@/types';
import ResultsChart from '@/components/ResultsChart';
import { FiArrowLeft, FiTrendingUp, FiActivity, FiAward, FiAlertTriangle, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { exportToPDF } from '@/lib/pdfExport';
import { calculateOverallAverage, calculateTotalOverallScore } from '@/lib/utils';

export default function ResultsPage() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalScore: 0,
    average: 0,
    completedSemesters: 0,
    bestSemester: 0,
    worstSemester: 0,
    criticalSubjects: 0,
    totalSubjects: 0,
    bestAverage: 0,
    worstAverage: 0
  });
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = getStoredData();
    setSemesters(data);
    
    const validSemesters = data.filter(s => s.subjects.length > 0);
    
    if (validSemesters.length === 0) {
      router.push('/');
      return;
    }

    // Hitung statistik keseluruhan sesuai rumus baru
    const totalScore = calculateTotalOverallScore(validSemesters);
    const totalSubjects = validSemesters.reduce((sum, sem) => sum + sem.subjects.length, 0);
    const average = calculateOverallAverage(validSemesters);

    // Cari semester terbaik dan terburuk berdasarkan rata-rata
    const averages = validSemesters.map(sem => sem.average);
    const bestAvg = Math.max(...averages);
    const worstAvg = Math.min(...averages);
    const bestSemester = validSemesters.find(sem => sem.average === bestAvg)?.id || 0;
    const worstSemester = validSemesters.find(sem => sem.average === worstAvg)?.id || 0;

    // Hitung critical subjects (nilai di bawah KKM)
    let criticalSubjects = 0;
    let totalSubjectsCount = 0;
    
    validSemesters.forEach(semester => {
      semester.subjects.forEach(subject => {
        totalSubjectsCount++;
        if (subject.score < subject.kkm) {
          criticalSubjects++;
        }
      });
    });

    setOverallStats({
      totalScore,
      average,
      completedSemesters: validSemesters.length,
      bestSemester,
      worstSemester,
      criticalSubjects,
      totalSubjects: totalSubjectsCount,
      bestAverage: bestAvg,
      worstAverage: worstAvg
    });

    // Expand semua semester secara default
    setExpandedSemesters(validSemesters.map(sem => sem.id));

    // Siapkan data untuk chart dengan KKM
    const subjectsMap = new Map<string, {scores: number[], kkm: number}>();
    
    validSemesters.forEach((semester, semIndex) => {
      semester.subjects.forEach(subject => {
        if (!subjectsMap.has(subject.name)) {
          subjectsMap.set(subject.name, { scores: Array(5).fill(0), kkm: subject.kkm });
        }
        const data = subjectsMap.get(subject.name)!;
        data.scores[semIndex] = subject.score;
        data.kkm = subject.kkm;
      });
    });

    const chartDataArray: ChartData[] = Array.from(subjectsMap.entries()).map(([subject, data]) => ({
      subject,
      semester1: data.scores[0],
      semester2: data.scores[1],
      semester3: data.scores[2],
      semester4: data.scores[3],
      semester5: data.scores[4],
      kkm: data.kkm
    }));

    setChartData(chartDataArray);
  }, [router]);

  const toggleSemester = (semesterId: number) => {
    setExpandedSemesters(prev =>
      prev.includes(semesterId)
        ? prev.filter(id => id !== semesterId)
        : [...prev, semesterId]
    );
  };

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

  const handleExportImagePDF = async () => {
    setIsExporting(true);
    try {
      if (exportRef.current) {
        await exportToPDF('export-content', `Analisis-Rapor-Agit-${new Date().toISOString().split('T')[0]}`);
      }
    } catch (error) {
      console.error('Error exporting image PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const calculateDisplayStats = () => {
    const validSemesters = semesters.filter(s => s.subjects.length > 0);
    let totalMapel = 0;
    let totalSkor = 0;
    
    validSemesters.forEach(semester => {
      totalMapel += semester.subjects.length;
      totalSkor += semester.totalScore;
    });
    
    return { totalMapel, totalSkor };
  };

  const displayStats = calculateDisplayStats();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="mr-1" size={14} />
              Kembali ke Dashboard
            </button>
          </div>
          
          <div>
            <h1 className="text-lg font-bold text-gray-900">Analisis Lengkap Nilai</h1>
            <p className="text-xs text-gray-600">Grafik dan statistik dari semua semester</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={exportRef} id="export-content" className="container mx-auto px-4 py-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                <FiActivity className="text-blue-600" size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Skor Keseluruhan</p>
                <p className="text-lg font-bold text-gray-900">
                  {overallStats.totalScore.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Jumlah semua nilai dari {displayStats.totalMapel} mapel
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <div className="w-7 h-7 bg-green-100 rounded-md flex items-center justify-center mr-2">
                <FiTrendingUp className="text-green-600" size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rata-rata Keseluruhan</p>
                <p className="text-lg font-bold text-gray-900">
                  {overallStats.average.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {overallStats.totalScore} ÷ {displayStats.totalMapel} = {overallStats.average.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <div className="w-7 h-7 bg-purple-100 rounded-md flex items-center justify-center mr-2">
                <FiAward className="text-purple-600" size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tren Prestasi</p>
                <p className="text-base font-bold text-gray-900 flex items-center">
                  {trend.icon} <span className={`ml-1 ${trend.color}`}>{trend.text}</span>
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {overallStats.completedSemesters} semester terisi
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <div className="w-7 h-7 bg-red-100 rounded-md flex items-center justify-center mr-2">
                <FiAlertTriangle className="text-red-600" size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Critical Subjects</p>
                <p className="text-lg font-bold text-gray-900">
                  {overallStats.criticalSubjects}/{overallStats.totalSubjects}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Nilai di bawah KKM
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-2">Grafik Perkembangan Nilai</h2>
          <p className="text-sm text-gray-600 mb-4">
            Perkembangan nilai setiap mata pelajaran dari semester 1-5 dengan indikator KKM
          </p>
          <ResultsChart data={chartData} />
          
          {/* Tombol Export PDF di bawah chart */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleExportImagePDF}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="mr-2" size={14} />
                  Export sebagai PDF (Gambar)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Semester Details - PERBAIKAN DI SINI */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Detail per Semester</h2>
            <button
              onClick={() => {
                const validSemesters = semesters.filter(s => s.subjects.length > 0);
                if (expandedSemesters.length === validSemesters.length) {
                  setExpandedSemesters([]);
                } else {
                  setExpandedSemesters(validSemesters.map(s => s.id));
                }
              }}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              {expandedSemesters.length === semesters.filter(s => s.subjects.length > 0).length ? 
                'Tutup Semua' : 'Buka Semua'}
            </button>
          </div>
          
          <div className="space-y-2">
            {semesters
              .filter(s => s.subjects.length > 0)
              .sort((a, b) => a.id - b.id)
              .map((semester) => {
                const semesterAverage = semester.average;
                const criticalCount = semester.subjects.filter(s => s.score < s.kkm).length;
                const isExpanded = expandedSemesters.includes(semester.id);
                
                return (
                  <div key={semester.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Semester Header */}
                    <div 
                      className="bg-gray-50 hover:bg-gray-100 px-3 py-3 cursor-pointer transition-colors"
                      onClick={() => toggleSemester(semester.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isExpanded ? 
                            <FiChevronUp className="text-gray-500" size={16} /> : 
                            <FiChevronDown className="text-gray-500" size={16} />
                          }
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Semester {semester.id}</h3>
                            <p className="text-xs text-gray-500">
                              {semester.id <= 2 ? 'Kelas 10' : semester.id <= 4 ? 'Kelas 11' : 'Kelas 12'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Rata-rata</p>
                            <p className="font-bold text-gray-900 text-sm">{semesterAverage.toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Total Skor</p>
                            <p className="font-bold text-gray-900 text-sm">{semester.totalScore.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Mapel</p>
                            <p className="font-bold text-gray-900 text-sm">{semester.subjects.length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Critical</p>
                            <p className={`font-bold text-sm ${criticalCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {criticalCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subjects Grid - Tampil saat expanded */}
                    {isExpanded && (
                      <div className="p-3 border-t border-gray-200 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {semester.subjects.map((subject) => {
                            const isBelowKKM = subject.score < subject.kkm;
                            const scoreColor = subject.score >= 85 ? 'text-green-600' :
                                              subject.score >= 75 ? 'text-amber-600' :
                                              subject.score >= 65 ? 'text-orange-600' : 'text-red-600';
                            
                            return (
                              <div 
                                key={subject.id} 
                                className={`border rounded p-2 transition-all hover:shadow-sm ${
                                  isBelowKKM ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <p className="font-medium text-gray-900 text-xs truncate flex-1 mr-2">
                                    {subject.name}
                                  </p>
                                  {isBelowKKM && (
                                    <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                      Critical
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`text-xl font-bold ${scoreColor}`}>
                                      {subject.score}
                                    </p>
                                    <p className="text-xs text-gray-500">Nilai</p>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className={`text-sm font-medium ${
                                      subject.score >= subject.kkm ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      KKM: {subject.kkm}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Critical Analysis */}
        {overallStats.criticalSubjects > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-3">
              <FiAlertTriangle className="text-red-600 mr-2" size={14} />
              <h2 className="text-base font-bold text-red-800">Analisis Critical Subjects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-red-700">
                  Terdapat <strong>{overallStats.criticalSubjects} mata pelajaran</strong> dengan nilai di bawah KKM.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Mata pelajaran berikut memerlukan perhatian khusus untuk perbaikan:
                </p>
              </div>
              <div className="space-y-1.5">
                {semesters
                  .filter(semester => semester.subjects.length > 0)
                  .flatMap(semester => 
                    semester.subjects
                      .filter(subject => subject.score < subject.kkm)
                      .map(subject => ({
                        ...subject,
                        semester: semester.id
                      }))
                  )
                  .slice(0, 5)
                  .map((subject, index) => (
                    <div key={index} className="flex justify-between items-center bg-red-100 rounded p-2.5">
                      <div>
                        <p className="font-medium text-red-800 text-sm">{subject.name}</p>
                        <p className="text-xs text-red-600">Semester {subject.semester}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-800">{subject.score}</p>
                        <p className="text-xs text-red-600">KKM: {subject.kkm}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-base font-bold text-gray-900 mb-2">Analisis dan Rekomendasi</h2>
          <div className="space-y-3">
            {overallStats.average >= 85 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-1 text-sm">🎉 Prestasi Sangat Baik!</h4>
                <p className="text-green-700 text-sm">
                  Rata-rata nilai Anda sangat baik ({overallStats.average.toFixed(2)}). 
                  Pertahankan konsistensi belajar dan fokus pada pengembangan di bidang yang Anda minati.
                </p>
              </div>
            ) : overallStats.average >= 75 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="font-semibold text-amber-800 mb-1 text-sm">👍 Prestasi Baik</h4>
                <p className="text-amber-700 text-sm">
                  Prestasi akademik Anda baik ({overallStats.average.toFixed(2)}). 
                  Coba tingkatkan mata pelajaran yang masih di bawah rata-rata untuk mencapai hasil yang lebih optimal.
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="font-semibold text-orange-800 mb-1 text-sm">💪 Perlu Peningkatan</h4>
                <p className="text-orange-700 text-sm">
                  Perlu fokus lebih pada mata pelajaran dengan nilai terendah. 
                  Identifikasi kesulitan belajar dan cari strategi yang lebih efektif.
                </p>
              </div>
            )}
            
            {overallStats.criticalSubjects > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="font-semibold text-red-800 mb-1 text-sm">⚠️ Perhatian Khusus</h4>
                <p className="text-red-700 text-sm">
                  Terdapat {overallStats.criticalSubjects} mata pelajaran dengan nilai di bawah KKM. 
                  Fokus pada peningkatan pemahaman materi dan konsultasi dengan guru untuk strategi belajar.
                </p>
              </div>
            )}
            
            {overallStats.bestSemester > 0 && overallStats.worstSemester > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 mb-1 text-sm">📊 Performa Terbaik dan Terendah</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-600">Semester Terbaik</p>
                    <p className="font-bold text-blue-800">Semester {overallStats.bestSemester}</p>
                    <p className="text-xs text-blue-600">Rata-rata: {overallStats.bestAverage.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Semester Perlu Perbaikan</p>
                    <p className="font-bold text-blue-800">Semester {overallStats.worstSemester}</p>
                    <p className="text-xs text-blue-600">Rata-rata: {overallStats.worstAverage.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}