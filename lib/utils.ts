// lib/utils.ts
export const calculateSemesterAverage = (subjects: { score: number }[]): number => {
  if (subjects.length === 0) return 0;
  const totalScore = subjects.reduce((sum, subject) => sum + subject.score, 0);
  return Number((totalScore / subjects.length).toFixed(2));
};

// Tambahkan fungsi-fungsi yang dibutuhkan
export const calculateAverage = (subjects: { score: number }[]): number => {
  // Alias untuk calculateSemesterAverage agar kompatibel dengan import yang ada
  return calculateSemesterAverage(subjects);
};

export const calculateTotalScore = (subjects: { score: number }[]): number => {
  return subjects.reduce((sum, subject) => sum + subject.score, 0);
};

export const calculateOverallAverage = (semesters: { subjects: { score: number }[] }[]): number => {
  let totalScore = 0;
  let totalSubjects = 0;
  
  semesters.forEach(semester => {
    semester.subjects.forEach(subject => {
      totalScore += subject.score;
      totalSubjects++;
    });
  });
  
  return totalSubjects > 0 ? Number((totalScore / totalSubjects).toFixed(2)) : 0;
};

export const calculateTotalOverallScore = (semesters: { subjects: { score: number }[] }[]): number => {
  return semesters.reduce((total, semester) => {
    return total + semester.subjects.reduce((sum, subject) => sum + subject.score, 0);
  }, 0);
};

export const formatNumber = (num: number): string => {
  return num.toFixed(2).replace('.', ',');
};

export const getStatusColor = (score: number, kkm?: number) => {
  if (kkm && score < kkm) return 'text-red-600';
  if (score >= 85) return 'text-green-600';
  if (score >= 75) return 'text-amber-600';
  if (score >= 65) return 'text-orange-600';
  return 'text-red-600';
};

// Fungsi tambahan untuk konversi string ke number dengan aman
export const safeParseInt = (value: string, defaultValue: number = 0): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeParseFloat = (value: string, defaultValue: number = 0): number => {
  const cleaned = value.replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
};