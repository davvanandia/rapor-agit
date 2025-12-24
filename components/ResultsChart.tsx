'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartData } from '@/types';
import { FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiChevronDown } from 'react-icons/fi';

interface ResultsChartProps {
  data: ChartData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const isCritical = entry.payload[`${entry.dataKey}_kkm`] && entry.value < entry.payload[`${entry.dataKey}_kkm`];
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600">{entry.name}:</span>
                  {isCritical && (
                    <FiAlertTriangle className="ml-2 text-red-500" size={12} />
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
                    {entry.value}
                  </span>
                  {entry.payload[`${entry.dataKey}_kkm`] && (
                    <div className="text-xs text-gray-500">KKM: {entry.payload[`${entry.dataKey}_kkm`]}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function ResultsChart({ data }: ResultsChartProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  // Filter data yang memiliki nilai di minimal 1 semester
  const validData = data.filter(item => {
    const scores = [item.semester1, item.semester2, item.semester3, item.semester4, item.semester5];
    return scores.some(score => score > 0);
  });

  // Daftar mata pelajaran untuk dropdown
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...validData.map(item => ({
      value: item.subject,
      label: item.subject
    }))
  ];

  // Filter data berdasarkan pilihan
  const filteredData = selectedSubject === 'all' 
    ? validData 
    : validData.filter(item => item.subject === selectedSubject);

  // Siapkan data untuk chart dengan KKM
  const prepareChartData = () => {
    const semestersData = [];
    
    // Cek setiap semester apakah ada data
    if (filteredData.some(d => d.semester1 > 0)) semestersData.push({ 
      semester: 'Sem 1', 
      ...Object.fromEntries(filteredData.map(d => [d.subject, d.semester1])),
      ...Object.fromEntries(filteredData.map(d => [`${d.subject}_kkm`, d.kkm]))
    });
    
    if (filteredData.some(d => d.semester2 > 0)) semestersData.push({ 
      semester: 'Sem 2', 
      ...Object.fromEntries(filteredData.map(d => [d.subject, d.semester2])),
      ...Object.fromEntries(filteredData.map(d => [`${d.subject}_kkm`, d.kkm]))
    });
    
    if (filteredData.some(d => d.semester3 > 0)) semestersData.push({ 
      semester: 'Sem 3', 
      ...Object.fromEntries(filteredData.map(d => [d.subject, d.semester3])),
      ...Object.fromEntries(filteredData.map(d => [`${d.subject}_kkm`, d.kkm]))
    });
    
    if (filteredData.some(d => d.semester4 > 0)) semestersData.push({ 
      semester: 'Sem 4', 
      ...Object.fromEntries(filteredData.map(d => [d.subject, d.semester4])),
      ...Object.fromEntries(filteredData.map(d => [`${d.subject}_kkm`, d.kkm]))
    });
    
    if (filteredData.some(d => d.semester5 > 0)) semestersData.push({ 
      semester: 'Sem 5', 
      ...Object.fromEntries(filteredData.map(d => [d.subject, d.semester5])),
      ...Object.fromEntries(filteredData.map(d => [`${d.subject}_kkm`, d.kkm]))
    });

    return semestersData;
  };

  const semestersData = prepareChartData();

  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#6366f1', // Indigo
  ];

  // Calculate trends dengan analisis KKM
  const calculateSubjectTrends = () => {
    return filteredData.map((subject, index) => {
      const scores = [subject.semester1, subject.semester2, subject.semester3, subject.semester4, subject.semester5];
      const validScores = scores.filter(score => score > 0);
      const startScore = validScores[0] || 0;
      const endScore = validScores[validScores.length - 1] || 0;
      const trend = validScores.length >= 2 ? endScore - startScore : 0;
      const isCritical = endScore < subject.kkm;
      const averageScore = validScores.length > 0 
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
        : 0;

      // Hitung semester dengan nilai terendah dan tertinggi
      let minScore = Math.min(...validScores);
      let maxScore = Math.max(...validScores);
      const minSemester = scores.findIndex(score => score === minScore) + 1;
      const maxSemester = scores.findIndex(score => score === maxScore) + 1;

      return {
        subject: subject.subject,
        start: startScore,
        end: endScore,
        trend,
        kkm: subject.kkm,
        isCritical,
        hasMultipleSemesters: validScores.length >= 2,
        direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
        averageScore,
        minScore: minScore,
        maxScore: maxScore,
        minSemester: minSemester > 0 ? `Sem ${minSemester}` : '-',
        maxSemester: maxSemester > 0 ? `Sem ${maxSemester}` : '-',
        color: colors[index % colors.length]
      };
    });
  };

  const subjectTrends = calculateSubjectTrends();

  if (validData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-900 font-medium mb-2">Belum ada data trend</p>
        <p className="text-gray-600 text-sm">
          Input data semester untuk melihat grafik trend
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Dropdown */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Statistik Per Mata Pelajaran</h2>
            <p className="text-sm text-gray-600">Pilih mata pelajaran untuk melihat analisis detail</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {subjectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <FiChevronDown className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Statistik Ringkasan */}
        {selectedSubject !== 'all' && subjectTrends.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Rata-rata</p>
                <p className="text-xl font-bold text-gray-900">
                  {subjectTrends[0].averageScore.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Tertinggi</p>
                <p className="text-xl font-bold text-green-600">
                  {subjectTrends[0].maxScore}
                </p>
                <p className="text-xs text-gray-500">{subjectTrends[0].maxSemester}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Terendah</p>
                <p className="text-xl font-bold text-red-600">
                  {subjectTrends[0].minScore}
                </p>
                <p className="text-xs text-gray-500">{subjectTrends[0].minSemester}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">KKM</p>
                <p className={`text-xl font-bold ${subjectTrends[0].end >= subjectTrends[0].kkm ? 'text-green-600' : 'text-red-600'}`}>
                  {subjectTrends[0].kkm}
                </p>
                <p className="text-xs text-gray-500">
                  {subjectTrends[0].end >= subjectTrends[0].kkm ? '✓ Tuntas' : '✗ Tidak Tuntas'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={semestersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="semester" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {filteredData.slice(0, selectedSubject === 'all' ? 6 : filteredData.length).map((subject, index) => (
              <>
                <Line
                  key={subject.subject}
                  type="monotone"
                  dataKey={subject.subject}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  activeDot={{ r: 4 }}
                  dot={{ r: 3 }}
                  name={subject.subject}
                />
                {/* Tambah garis KKM sebagai reference line jika hanya satu mapel */}
                {selectedSubject !== 'all' && (
                  <ReferenceLine 
                    y={subject.kkm} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: `KKM: ${subject.kkm}`, 
                      position: 'right',
                      fill: '#ef4444',
                      fontSize: 12 
                    }} 
                  />
                )}
              </>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Mata Pelajaran */}
      {selectedSubject !== 'all' && subjectTrends.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Detail Nilai per Semester</h3>
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nilai
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KKM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selisih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map(semNum => {
                  const score = filteredData[0][`semester${semNum}` as keyof ChartData] as number;
                  const kkm = filteredData[0].kkm;
                  const isCritical = score < kkm && score > 0;
                  
                  return (
                    <tr key={semNum} className={score > 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Semester {semNum}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {score > 0 ? score : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {kkm}
                      </td>
                      <td className="px-4 py-3">
                        {score > 0 ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isCritical 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isCritical ? (
                              <>
                                <FiAlertTriangle className="mr-1" size={10} />
                                Tidak Tuntas
                              </>
                            ) : 'Tuntas'}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {score > 0 ? (
                          <span className={`font-medium ${
                            score >= kkm ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {score >= kkm ? '+' : ''}{(score - kkm).toFixed(1)}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trend Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {subjectTrends.slice(0, selectedSubject === 'all' ? 6 : subjectTrends.length).map((trend, index) => (
          <div key={trend.subject} className={`border rounded-md p-3 ${trend.isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: trend.color }}
                />
                <span className="text-sm font-medium text-gray-900 truncate">{trend.subject}</span>
                {trend.isCritical && (
                  <FiAlertTriangle className="ml-2 text-red-500" size={12} />
                )}
              </div>
              {trend.hasMultipleSemesters ? (
                <div className={`text-sm font-semibold ${trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {trend.direction === 'up' ? '+' : ''}{trend.trend.toFixed(1)}
                </div>
              ) : (
                <div className="text-xs text-gray-500">1 semester</div>
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Nilai: {trend.end.toFixed(1)}</span>
              <span>KKM: {trend.kkm}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={trend.end >= trend.kkm ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {trend.end >= trend.kkm ? '✓ Tuntas' : '✗ Tidak Tuntas'}
              </span>
              {trend.hasMultipleSemesters && (
                <span>Trend: {trend.direction === 'up' ? 'Naik' : trend.direction === 'down' ? 'Turun' : 'Stabil'}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Critical Subjects Summary */}
      {subjectTrends.filter(t => t.isCritical).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center mb-2">
            <FiAlertTriangle className="text-red-600 mr-2" />
            <h4 className="font-medium text-red-800">Analisis Critical Subjects</h4>
          </div>
          <p className="text-sm text-red-700">
            Terdapat {subjectTrends.filter(t => t.isCritical).length} mata pelajaran dengan nilai di bawah KKM.
          </p>
          {selectedSubject === 'all' && (
            <div className="mt-2 text-sm text-red-600">
              {subjectTrends.filter(t => t.isCritical).map(t => t.subject).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}