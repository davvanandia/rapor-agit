import { SemesterData } from '@/types';

const STORAGE_KEY = 'rapor_agit_data';
const SUBJECTS_LIST_KEY = 'rapor_agit_subjects_list';

export const getStoredData = (): SemesterData[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : Array(5).fill(null).map((_, i) => ({
    id: i + 1,
    subjects: [],
    totalScore: 0,
    average: 0,
    subjectCount: 0
  }));
};

export const saveSemesterData = (semesterId: number, data: Partial<SemesterData>) => {
  const allData = getStoredData();
  allData[semesterId - 1] = { ...allData[semesterId - 1], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  
  // Update daftar mapel global
  if (data.subjects && data.subjects.length > 0) {
    updateSubjectsList(data.subjects.map(s => s.name));
  }
  
  return allData;
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SUBJECTS_LIST_KEY);
};

// Daftar mapel global
export const getSubjectsList = (): string[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SUBJECTS_LIST_KEY);
  return data ? JSON.parse(data) : [];
};

export const updateSubjectsList = (subjects: string[]) => {
  if (typeof window === 'undefined') return;
  
  const existingList = getSubjectsList();
  const newList = [...existingList];
  
  subjects.forEach(subject => {
    if (!newList.includes(subject)) {
      newList.push(subject);
    }
  });
  
  localStorage.setItem(SUBJECTS_LIST_KEY, JSON.stringify(newList));
};

export const addSubjectToList = (subject: string) => {
  if (typeof window === 'undefined') return;
  
  const existingList = getSubjectsList();
  if (!existingList.includes(subject)) {
    existingList.push(subject);
    localStorage.setItem(SUBJECTS_LIST_KEY, JSON.stringify(existingList));
  }
};