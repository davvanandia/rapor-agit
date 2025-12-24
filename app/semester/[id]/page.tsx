'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoredData, saveSemesterData, getSubjectsList, addSubjectToList } from '@/lib/storage';
import { SemesterData, Subject } from '@/types';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiSearch, FiInfo, FiCheck, FiBook, FiX, FiAlertTriangle, FiEdit2, FiSave, FiTrash2 } from 'react-icons/fi';

export default function SemesterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const semesterId = parseInt(params.id as string);
  
  const [semester, setSemester] = useState<SemesterData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState({ name: '', score: 0, kkm: '' });
  const [allSubjectsList, setAllSubjectsList] = useState<{name: string, lastKKM: number}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    setAllSubjectsList(getSubjectsList());
    
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [semesterId]);

  const loadData = () => {
    const data = getStoredData();
    const semesterData = data[semesterId - 1];
    setSemester(semesterData);
    setSubjects(semesterData.subjects || []);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    // Validasi input
    if (!newSubject.name.trim() || newSubject.score < 1 || newSubject.score > 100) {
      await Swal.fire({
        icon: 'error',
        title: 'Input Tidak Valid',
        html: '<p class="text-gray-600">Nama wajib diisi, nilai harus antara 1-100</p>',
        background: '#ffffff',
        color: '#374151',
        customClass: {
          popup: 'rounded-lg border border-gray-200'
        }
      });
      setIsAdding(false);
      return;
    }

    // Parse KKM - lebih fleksibel untuk menerima angka dengan koma atau desimal
    let kkmValue = 75; // Default
    if (newSubject.kkm.trim() !== '') {
      // Hapus spasi dan ganti koma dengan titik
      const cleanedKKM = newSubject.kkm.trim().replace(',', '.');
      const parsedKKM = parseFloat(cleanedKKM);
      
      // Validasi angka
      if (!isNaN(parsedKKM) && parsedKKM >= 0 && parsedKKM <= 100) {
        kkmValue = Math.round(parsedKKM * 100) / 100; // Pertahankan 2 desimal
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'KKM Tidak Valid',
          html: '<p class="text-gray-600">KKM harus berupa angka antara 0-100. Menggunakan nilai default 75.</p>',
          background: '#ffffff',
          color: '#374151',
          customClass: {
            popup: 'rounded-lg border border-gray-200'
          }
        });
      }
    }

    const newSubjectObj: Subject = {
      id: `${Date.now()}-${Math.random()}`,
      name: newSubject.name.trim(),
      score: newSubject.score,
      kkm: kkmValue,
    };

    const updatedSubjects = [...subjects, newSubjectObj];
    updateSemester(updatedSubjects);
    
    addSubjectToList(newSubjectObj);
    setAllSubjectsList(getSubjectsList());
    
    setNewSubject({ name: '', score: 0, kkm: '' });
    setShowSuggestions(false);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const updateSemester = (updatedSubjects: Subject[]) => {
    const scores = updatedSubjects.map(s => s.score);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const average = updatedSubjects.length > 0 
      ? Number((totalScore / updatedSubjects.length).toFixed(2))
      : 0;

    saveSemesterData(semesterId, {
      subjects: updatedSubjects,
      totalScore,
      average,
      subjectCount: updatedSubjects.length
    });

    setSubjects(updatedSubjects);
    setSemester(prev => prev ? {
      ...prev,
      subjects: updatedSubjects,
      totalScore,
      average
    } : null);
  };

  const handleDelete = async (subjectId: string, subjectName: string) => {
    const result = await Swal.fire({
      title: 'Hapus Mata Pelajaran?',
      html: `<p class="text-gray-600">Mata pelajaran <strong>"${subjectName}"</strong> akan dihapus dari semester ini.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
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
      const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
      updateSemester(updatedSubjects);
    }
  };

  const handleClearAll = async () => {
    if (subjects.length === 0) return;

    const result = await Swal.fire({
      title: 'Hapus Semua Mata Pelajaran?',
      text: `Semua ${subjects.length} mata pelajaran akan dihapus dari semester ini.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus Semua',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#374151',
      customClass: {
        popup: 'rounded-lg border border-gray-200'
      }
    });

    if (result.isConfirmed) {
      updateSemester([]);
    }
  };

  // Fungsi untuk memulai edit
  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditSubject({ ...subject });
  };

  // Fungsi untuk menyimpan edit
  const saveEdit = async () => {
    if (!editSubject) return;

    // Validasi nilai
    if (editSubject.score < 1 || editSubject.score > 100) {
      await Swal.fire({
        icon: 'error',
        title: 'Nilai Tidak Valid',
        text: 'Nilai harus antara 1-100',
        background: '#ffffff',
        color: '#374151',
        customClass: {
          popup: 'rounded-lg border border-gray-200'
        }
      });
      return;
    }

    const updatedSubjects = subjects.map(subject => 
      subject.id === editingId ? editSubject : subject
    );

    updateSemester(updatedSubjects);
    setEditingId(null);
    setEditSubject(null);

    // Update juga di list subjects global
    const currentSubject = allSubjectsList.find(item => item.name === editSubject.name);
    if (currentSubject) {
      addSubjectToList(editSubject);
      setAllSubjectsList(getSubjectsList());
    }
  };

  // Fungsi untuk membatalkan edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditSubject(null);
  };

  const filteredSuggestions = allSubjectsList.filter(subject =>
    subject.name.toLowerCase().includes(newSubject.name.toLowerCase())
  );

  if (!semester) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data semester...</p>
        </div>
      </div>
    );
  }

  const getClassLabel = (id: number) => {
    if (id <= 2) return 'Kelas 10';
    if (id <= 4) return 'Kelas 11';
    return 'Kelas 12';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <Link 
                href="/" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Kembali ke Dashboard
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-700">{semesterId}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Semester {semesterId}</h1>
                  <p className="text-gray-600">{getClassLabel(semesterId)}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                <p className="text-sm text-gray-500 mb-1">Rata-rata</p>
                <p className="text-xl font-bold text-gray-900">
                  {semester.average > 0 ? semester.average.toFixed(2) : '--'}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                <p className="text-sm text-gray-500 mb-1">Total Skor</p>
                <p className="text-xl font-bold text-gray-900">
                  {semester.totalScore > 0 ? semester.totalScore.toLocaleString('id-ID') : '--'}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                <p className="text-sm text-gray-500 mb-1">Mata Pelajaran</p>
                <p className="text-xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Add Subject Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FiBook className="mr-3 text-blue-600" />
            Tambah Mata Pelajaran Baru
          </h2>
          
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative" ref={suggestionsRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Mata Pelajaran
                  <span className="text-xs text-gray-500 ml-2">(Saran dari semester sebelumnya)</span>
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => {
                      setNewSubject({ ...newSubject, name: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="input-field w-full pl-10"
                    placeholder="Contoh: Matematika"
                    required
                    disabled={isAdding}
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {showSuggestions && newSubject.name && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <p className="text-xs text-gray-500 px-2">Saran ({filteredSuggestions.length})</p>
                    </div>
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setNewSubject({ 
                            ...newSubject, 
                            name: suggestion.name,
                            kkm: suggestion.lastKKM.toString() 
                          });
                          setShowSuggestions(false);
                          inputRef.current?.focus();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          <FiCheck className="mr-3 text-blue-600" />
                          <span>{suggestion.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">KKM: {suggestion.lastKKM}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newSubject.score || ''}
                  onChange={(e) => setNewSubject({ ...newSubject, score: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                  placeholder="Masukkan nilai"
                  required
                  disabled={isAdding}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KKM (Kriteria Ketuntasan Minimal)
                </label>
                <input
                  type="text"
                  value={newSubject.kkm}
                  onChange={(e) => setNewSubject({ ...newSubject, kkm: e.target.value })}
                  className="input-field w-full"
                  placeholder="Contoh: 75, 70, 78.5, 80"
                  title="Masukkan angka KKM sesuai dengan sekolah dan semester anda"
                  disabled={isAdding}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                {allSubjectsList.length > 0 && (
                  <p className="flex items-center">
                    <FiInfo className="inline mr-2" />
                    {filteredSuggestions.length} saran dari {allSubjectsList.length} mata pelajaran tersimpan
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isAdding}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menambahkan...</span>
                  </>
                ) : (
                  <>
                    <FiPlus />
                    <span>Tambah Mata Pelajaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Subjects List */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Daftar Mata Pelajaran ({subjects.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Klik tombol edit (✏️) untuk mengubah, atau hapus (🗑️) untuk menghapus
              </p>
            </div>
            
            {subjects.length > 0 && (
              <button
                onClick={handleClearAll}
                className="mt-4 sm:mt-0 px-4 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                Hapus Semua
              </button>
            )}
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Mata Pelajaran</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Mulai dengan menambahkan mata pelajaran pertama menggunakan form di atas.
                Nilai KKM akan tersimpan untuk konsistensi di semester berikutnya.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, index) => {
                const isBelowKKM = subject.score < subject.kkm;
                const scoreColor = isBelowKKM ? 'text-red-600' :
                                 subject.score >= 85 ? 'text-green-600' :
                                 subject.score >= 75 ? 'text-amber-600' :
                                 subject.score >= 65 ? 'text-orange-600' : 'text-red-600';
                
                const bgColor = isBelowKKM ? 'bg-red-50 border-red-200' :
                               subject.score >= 85 ? 'bg-green-50 border-green-200' :
                               subject.score >= 75 ? 'bg-amber-50 border-amber-200' :
                               subject.score >= 65 ? 'bg-orange-50 border-orange-200' : 
                               'bg-red-50 border-red-200';
                
                // Mode edit
                if (editingId === subject.id && editSubject) {
                  return (
                    <div key={subject.id} className={`p-4 rounded-md border ${bgColor}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <FiEdit2 className="text-blue-600" />
                          </div>
                          <h4 className="font-medium text-gray-900">Edit: {subject.name}</h4>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEdit}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Simpan"
                          >
                            <FiSave size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Batal"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nilai (1-100)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editSubject.score || ''}
                            onChange={(e) => setEditSubject({
                              ...editSubject,
                              score: parseInt(e.target.value) || 0
                            })}
                            className="input-field w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            KKM
                          </label>
                          <input
                            type="text"
                            value={editSubject.kkm.toString()}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Parse nilai untuk disimpan sebagai number
                              const parsedValue = parseFloat(value);
                              if (!isNaN(parsedValue)) {
                                setEditSubject({
                                  ...editSubject,
                                  kkm: parsedValue
                                });
                              } else {
                                // Jika bukan angka, set ke default
                                setEditSubject({
                                  ...editSubject,
                                  kkm: 75
                                });
                              }
                            }}
                            className="input-field w-full text-sm"
                            placeholder="Contoh: 75, 70, 78.5"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Mode tampil normal
                return (
                  <div
                    key={subject.id}
                    className={`p-4 rounded-md border ${bgColor} transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                          <span className="text-gray-700 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 truncate max-w-[150px]">
                            {subject.name}
                          </h4>
                          <div className="flex items-center text-xs text-blue-600 mt-1">
                            <FiCheck className="mr-1" size={10} />
                            KKM: {subject.kkm}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {isBelowKKM && (
                          <div className="text-red-600" title="Nilai di bawah KKM">
                            <FiAlertTriangle size={18} />
                          </div>
                        )}
                        <button
                          onClick={() => startEdit(subject)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id, subject.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Nilai</p>
                        <p className={`text-xl font-bold ${scoreColor}`}>
                          {subject.score}
                          {isBelowKKM && (
                            <span className="text-xs text-red-500 ml-2">(KKM: {subject.kkm})</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
              <FiInfo className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Fitur Input KKM Fleksibel</h4>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">KKM bisa berbeda tiap sekolah dan semester</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">Input KKM sebagai teks biasa (contoh: 75, 70.5, 78, 80)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">Jika kosong, akan menggunakan nilai default 75</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">Saran KKM dari semester sebelumnya tetap tersimpan untuk konsistensi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}