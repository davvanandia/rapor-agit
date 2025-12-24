// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useSearchParams, useRouter } from 'next/navigation';
// import Swal from 'sweetalert2';
// import { saveSemesterData, getStoredData } from '@/lib/storage';
// import { calculateAverage, calculateTotalScore } from '@/lib/utils';

// export default function SubjectInputPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const semesterId = parseInt(params.semesterId as string);
//   const subjectCount = parseInt(searchParams.get('count') || '0');

//   const [subjects, setSubjects] = useState<Array<{ name: string; score: number }>>(
//     Array(subjectCount).fill(null).map(() => ({ name: '', score: 0 }))
//   );
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const existingData = getStoredData()[semesterId - 1];
//     if (existingData && existingData.subjects.length > 0) {
//       setSubjects(existingData.subjects);
//     }
//   }, [semesterId]);

//   const handleInputChange = (index: number, field: 'name' | 'score', value: string | number) => {
//     const newSubjects = [...subjects];
//     if (field === 'name') {
//       newSubjects[index].name = value as string;
//     } else {
//       newSubjects[index].score = Number(value);
//     }
//     setSubjects(newSubjects);
//   };

//   const validateCurrentSubject = () => {
//     const current = subjects[currentIndex];
//     if (!current.name.trim()) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Nama Mapel Kosong',
//         text: 'Silakan isi nama mata pelajaran',
//         background: '#1f2937',
//         color: '#fff',
//       });
//       return false;
//     }
//     if (current.score <= 0 || current.score > 100) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Nilai Tidak Valid',
//         text: 'Nilai harus antara 1-100',
//         background: '#1f2937',
//         color: '#fff',
//       });
//       return false;
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (!validateCurrentSubject()) return;
    
//     if (currentIndex < subjectCount - 1) {
//       setCurrentIndex(currentIndex + 1);
//     } else {
//       handleFinish();
//     }
//   };

//   const handlePrevious = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     }
//   };

//   const handleFinish = async () => {
//     const allValid = subjects.every(s => s.name.trim() && s.score > 0 && s.score <= 100);
//     if (!allValid) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Data Tidak Lengkap',
//         text: 'Pastikan semua mata pelajaran terisi dengan benar',
//         background: '#1f2937',
//         color: '#fff',
//       });
//       return;
//     }

//     const scores = subjects.map(s => s.score);
//     const totalScore = calculateTotalScore(scores);
//     const average = calculateAverage(scores);

//     saveSemesterData(semesterId, {
//       subjects: subjects.map((s, i) => ({ ...s, id: `s${semesterId}-${i}` })),
//       totalScore,
//       average,
//       subjectCount: subjects.length
//     });

//     await Swal.fire({
//       title: 'Berhasil!',
//       text: `Data semester ${semesterId} berhasil disimpan`,
//       icon: 'success',
//       confirmButtonText: 'Lanjut',
//       background: '#1f2937',
//       color: '#fff',
//     });

//     router.push('/');
//   };

//   const progress = ((currentIndex + 1) / subjectCount) * 100;

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="card">
//         <div className="mb-8">
//           <div className="flex justify-between items-center mb-2">
//             <h1 className="text-2xl font-bold text-blue-300">
//               Semester {semesterId} - Input Mata Pelajaran
//             </h1>
//             <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full">
//               {currentIndex + 1} dari {subjectCount}
//             </span>
//           </div>
          
//           <div className="w-full bg-gray-700 rounded-full h-2.5">
//             <div 
//               className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             ></div>
//           </div>
//         </div>

//         <div className="space-y-6 mb-8">
//           <div>
//             <label className="block text-gray-300 mb-2">
//               Nama Mata Pelajaran
//             </label>
//             <input
//               type="text"
//               value={subjects[currentIndex].name}
//               onChange={(e) => handleInputChange(currentIndex, 'name', e.target.value)}
//               className="input-field w-full"
//               placeholder="Contoh: Matematika"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 mb-2">
//               Nilai (1-100)
//             </label>
//             <input
//               type="number"
//               min="1"
//               max="100"
//               value={subjects[currentIndex].score || ''}
//               onChange={(e) => handleInputChange(currentIndex, 'score', e.target.value)}
//               className="input-field w-full"
//               placeholder="Contoh: 85"
//             />
//           </div>

//           {subjects[currentIndex].score > 0 && (
//             <div className="bg-gray-900/50 p-4 rounded-lg">
//               <p className="text-gray-300">
//                 Nilai yang diinput: <span className="text-yellow-300 font-bold">
//                   {subjects[currentIndex].score}
//                 </span>
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-between">
//           <button
//             onClick={() => router.push('/')}
//             className="btn-secondary"
//           >
//             ← Kembali
//           </button>

//           <div className="flex gap-4">
//             {currentIndex > 0 && (
//               <button
//                 onClick={handlePrevious}
//                 className="btn-secondary"
//               >
//                 ← Sebelumnya
//               </button>
//             )}
            
//             <button
//               onClick={handleNext}
//               className="btn-primary"
//             >
//               {currentIndex < subjectCount - 1 ? 'Lanjut →' : 'Selesai'}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="card mt-6">
//         <h3 className="font-bold text-lg mb-4">Daftar Mapel yang Sudah Diisi</h3>
//         <div className="space-y-2 max-h-60 overflow-y-auto">
//           {subjects.map((subject, index) => (
//             subject.name && (
//               <div 
//                 key={index}
//                 className={`flex justify-between items-center p-3 rounded-lg ${
//                   index === currentIndex ? 'bg-blue-900/30' : 'bg-gray-900/30'
//                 }`}
//               >
//                 <div>
//                   <span className="text-gray-400 text-sm">#{index + 1}</span>
//                   <span className="ml-2">{subject.name}</span>
//                 </div>
//                 <span className="font-bold">{subject.score || '-'}</span>
//               </div>
//             )
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }