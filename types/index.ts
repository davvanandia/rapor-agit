export interface Subject {
  id: string;
  name: string;
  score: number;
  kkm: number; // Tambahkan KKM
}

export interface SemesterData {
  id: number;
  subjects: Subject[];
  totalScore: number;
  average: number;
  subjectCount: number;
}

export interface ChartData {
  subject: string;
  semester1: number;
  semester2: number;
  semester3: number;
  semester4: number;
  semester5: number;
  kkm: number; // Tambahkan KKM untuk chart
}

export interface SubjectInfo {
  name: string;
  lastKKM: number; // Untuk menyimpan KKM terakhir dari mapel
}