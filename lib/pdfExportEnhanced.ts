import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SemesterData } from '@/types';

// Deklarasi module untuk TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFOptions {
  studentName?: string;
  schoolName?: string;
}

// Warna tema profesional
const COLORS = {
  primary: [41, 128, 185],      // Biru utama
  secondary: [52, 152, 219],    // Biru sekunder
  success: [46, 204, 113],      // Hijau
  warning: [241, 196, 15],      // Kuning
  danger: [231, 76, 60],        // Merah
  accent: [155, 89, 182],       // Ungu
  dark: [52, 73, 94],           // Biru gelap
  light: [236, 240, 241],       // Abu-abu terang
  white: [255, 255, 255],       // Putih
  text: [44, 62, 80]           // Teks gelap
};

export const generateEnhancedReportPDF = async (
  semesters: SemesterData[],
  overallStats: any,
  chartData: any[],
  options: PDFOptions = {}
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Format tanggal lebih elegan
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const formattedTime = currentDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // ========== HALAMAN 1: COVER PROFESIONAL ==========
  // Background gradient effect (simulasi)
  doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Pola dekoratif di kiri atas
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2], 0.3);
  doc.circle(50, 50, 40, 'F');
  doc.circle(-30, 120, 60, 'F');
  
  // Judul Utama dengan efek shadow
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text('ANALISIS AKADEMIK', pageWidth / 2, 100, { align: 'center' });
  
  // Subjudul
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.text('Laporan Perkembangan Nilai Siswa', pageWidth / 2, 120, { align: 'center' });
  
  // Garis pemisah dekoratif
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 60, 130, pageWidth / 2 + 60, 130);
  
  // Informasi Siswa dalam box elegan
  const infoY = 160;
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2], 0.1);
  doc.roundedRect(pageWidth / 2 - 100, infoY, 200, 60, 5, 5, 'F');
  doc.setDrawColor(COLORS.white[0], COLORS.white[1], COLORS.white[2], 0.3);
  doc.roundedRect(pageWidth / 2 - 100, infoY, 200, 60, 5, 5);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text('INFORMASI LAPORAN', pageWidth / 2, infoY + 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Siswa: ${options.studentName || 'Siswa'}`, pageWidth / 2 - 80, infoY + 30);
  doc.text(`Sekolah: ${options.schoolName || 'Nama Sekolah'}`, pageWidth / 2 - 80, infoY + 40);
  doc.text(`Tanggal: ${formattedDate}`, pageWidth / 2 - 80, infoY + 50);
  doc.text(`Jam: ${formattedTime}`, pageWidth / 2 + 30, infoY + 50);
  
  // Footer cover
  doc.setFontSize(10);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2], 0.7);
  doc.text('Dokumen ini dibuat secara otomatis oleh sistem Rapor Agit', pageWidth / 2, 260, { align: 'center' });
  
  // Pola dekoratif di kanan bawah
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2], 0.2);
  doc.circle(pageWidth + 30, pageHeight - 50, 50, 'F');
  
  doc.addPage();

  // ========== HALAMAN 2: EXECUTIVE SUMMARY ==========
  // Header dengan gradien
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Icon/ornamen kecil
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2], 0.3);
  doc.circle(pageWidth - 30, 20, 8, 'F');
  doc.circle(pageWidth - 50, 20, 5, 'F');
  
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN EKSEKUTIF', pageWidth / 2, 25, { align: 'center' });
  
  let yPos = 55;
  
  // Box statistik utama dengan layout modern
  const mainStats = [
    { 
      label: 'Rata-rata Keseluruhan', 
      value: overallStats.average.toFixed(2),
      subtitle: 'Nilai Akumulasi',
      color: COLORS.primary,
      icon: '📊'
    },
    { 
      label: 'Total Skor', 
      value: overallStats.totalScore.toLocaleString('id-ID'),
      subtitle: 'Akumulasi Semua Nilai',
      color: COLORS.success,
      icon: '🎯'
    },
    { 
      label: 'Presensi Akademik', 
      value: `${overallStats.completedSemesters}/5 Semester`,
      subtitle: 'Tingkat Kelengkapan',
      color: COLORS.accent,
      icon: '📚'
    },
    { 
      label: 'Peringatan Nilai', 
      value: `${overallStats.criticalSubjects} dari ${overallStats.totalSubjects}`,
      subtitle: 'Nilai di Bawah KKM',
      color: overallStats.criticalSubjects > 0 ? COLORS.danger : COLORS.success,
      icon: '⚠️'
    }
  ];

  // Layout grid 2x2 untuk statistik
  mainStats.forEach((stat, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 20 + (col * 90);
    const y = yPos + (row * 55);
    
    // Box dengan shadow effect (simulasi dengan border)
    doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setDrawColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, 85, 50, 3, 3, 'FD');
    
    // Icon
    doc.setFontSize(20);
    doc.text(stat.icon, x + 15, y + 15);
    
    // Value (besar)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value.toString(), x + 35, y + 18);
    
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(stat.label, x + 10, y + 30, { maxWidth: 65 });
    
    // Subtitle
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(stat.subtitle, x + 10, y + 35, { maxWidth: 65 });
    
    // Garis dekoratif bawah
    doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.setLineWidth(2);
    doc.line(x + 10, y + 40, x + 75, y + 40);
  });

  yPos += 120;

  // Insight Box - Analisis Singkat
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(20, yPos, pageWidth - 40, 50, 5, 5, 'F');
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(1);
  doc.roundedRect(20, yPos, pageWidth - 40, 50, 5, 5);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text('📈 INSIGHT UTAMA', 30, yPos + 12);
  
  let insightText = '';
  if (overallStats.average >= 85) {
    insightText = 'Prestasi akademik siswa menunjukkan performa yang sangat baik dengan konsistensi tinggi.';
  } else if (overallStats.average >= 75) {
    insightText = 'Prestasi akademik berada pada level baik dengan beberapa area yang dapat ditingkatkan.';
  } else {
    insightText = 'Diperlukan fokus khusus pada peningkatan beberapa mata pelajaran untuk optimalisasi hasil.';
  }
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(insightText, 30, yPos + 25, { maxWidth: pageWidth - 80 });

  doc.addPage();

  // ========== HALAMAN 3: PERFORMANCE MATRIX ==========
  // Header dengan variasi
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Ornamen header
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2], 0.2);
  for (let i = 0; i < 5; i++) {
    doc.circle(20 + (i * 40), 20, 3, 'F');
  }
  
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MATRIKS PERFORMANSI', pageWidth / 2, 25, { align: 'center' });
  
  yPos = 55;
  
  // Tabel performa per semester dengan desain modern
  const validSemesters = semesters.filter(s => s.subjects.length > 0);
  
  validSemesters.forEach((semester, index) => {
    if (yPos > 200 && index < validSemesters.length - 1) {
      doc.addPage();
      yPos = 55;
    }
    
    // Header semester dengan gradien
    const semesterColor = semester.average >= 85 ? COLORS.success : 
                         semester.average >= 75 ? COLORS.secondary : 
                         semester.average >= 65 ? COLORS.warning : COLORS.danger;
    
    doc.setFillColor(semesterColor[0], semesterColor[1], semesterColor[2]);
    doc.roundedRect(20, yPos, pageWidth - 40, 15, 2, 2, 'F');
    
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const level = semester.id <= 2 ? 'Kelas 10' : semester.id <= 4 ? 'Kelas 11' : 'Kelas 12';
    doc.text(`SEMESTER ${semester.id} • ${level}`, 25, yPos + 10);
    
    // Statistik inline di header kanan
    doc.setFontSize(10);
    doc.text(`Rata-rata: ${semester.average.toFixed(2)}`, pageWidth - 100, yPos + 10);
    doc.text(`Skor: ${semester.totalScore}`, pageWidth - 50, yPos + 10);
    
    yPos += 20;
    
    // Grid mata pelajaran
    const subjects = semester.subjects;
    const gridCols = 4;
    const cellWidth = (pageWidth - 60) / gridCols;
    const cellHeight = 25;
    
    subjects.forEach((subject, idx) => {
      const col = idx % gridCols;
      const row = Math.floor(idx / gridCols);
      const x = 25 + (col * cellWidth);
      const y = yPos + (row * cellHeight);
      
      if (y + cellHeight > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        return;
      }
      
      // Box mata pelajaran
      const isCritical = subject.score < subject.kkm;
      const bgColor = isCritical ? COLORS.danger : 
                     subject.score >= 85 ? COLORS.success :
                     subject.score >= 75 ? [52, 152, 219] : // Biru
                     subject.score >= 65 ? COLORS.warning : [230, 126, 34]; // Orange
      
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2], 0.1);
      doc.setDrawColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, cellWidth - 5, cellHeight - 5, 3, 3, 'FD');
      
      // Nama mata pelajaran
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.text(subject.name.substring(0, 15), x + 5, y + 8, { maxWidth: cellWidth - 15 });
      
      // Nilai
      doc.setFontSize(10);
      doc.setTextColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.text(subject.score.toString(), x + 5, y + 18);
      
      // KKM
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`KKM: ${subject.kkm}`, x + cellWidth - 25, y + 18);
      
      // Status icon
      if (isCritical) {
        doc.setTextColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
        doc.text('⚠', x + cellWidth - 15, y + 18);
      }
    });
    
    yPos += Math.ceil(subjects.length / gridCols) * cellHeight + 15;
  });

  doc.addPage();

  // ========== HALAMAN 4: ANALISIS MENDALAM ==========
  // Header analisis
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Ornamen
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2], 0.3);
  doc.rect(pageWidth / 2 - 50, 15, 100, 2, 'F');
  
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALISIS MENDALAM & REKOMENDASI', pageWidth / 2, 25, { align: 'center' });
  
  yPos = 55;

  // Card: Tren Performa
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 8, 8, 'F');
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(1);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 8, 8);
  
  // Icon tren
  doc.setFontSize(24);
  doc.text('📈', 35, yPos + 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text('TREN PERFORMA', 55, yPos + 15);
  
  // Analisis tren
  const averages = validSemesters.map(s => s.average);
  let trendAnalysis = '';
  let trendIcon = '';
  
  if (averages.length >= 2) {
    const diff = averages[averages.length - 1] - averages[0];
    if (diff > 5) {
      trendAnalysis = 'Peningkatan signifikan (↑' + diff.toFixed(1) + ' poin)';
      trendIcon = '🚀';
    } else if (diff > 2) {
      trendAnalysis = 'Peningkatan stabil (↑' + diff.toFixed(1) + ' poin)';
      trendIcon = '↗️';
    } else if (diff < -5) {
      trendAnalysis = 'Perlu perhatian khusus (↓' + Math.abs(diff).toFixed(1) + ' poin)';
      trendIcon = '⚠️';
    } else if (diff < -2) {
      trendAnalysis = 'Penurunan ringan (↓' + Math.abs(diff).toFixed(1) + ' poin)';
      trendIcon = '↘️';
    } else {
      trendAnalysis = 'Stabil dan konsisten (±' + Math.abs(diff).toFixed(1) + ' poin)';
      trendIcon = '➡️';
    }
  } else {
    trendAnalysis = 'Data belum cukup untuk analisis tren';
    trendIcon = '📊';
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(trendIcon + ' ' + trendAnalysis, 55, yPos + 25);
  
  // Detail per semester
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const trendDetails = validSemesters.map(s => `S${s.id}: ${s.average.toFixed(1)}`).join(' → ');
  doc.text(trendDetails, 55, yPos + 33, { maxWidth: pageWidth - 100 });

  yPos += 55;

  // Card: Area Perbaikan
  if (overallStats.criticalSubjects > 0) {
    doc.setFillColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2], 0.1);
    doc.roundedRect(20, yPos, pageWidth - 40, 50, 8, 8, 'F');
    doc.setDrawColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
    doc.setLineWidth(1);
    doc.roundedRect(20, yPos, pageWidth - 40, 50, 8, 8);
    
    doc.setFontSize(24);
    doc.text('🎯', 35, yPos + 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
    doc.text('AREA PERBAIKAN', 55, yPos + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(`${overallStats.criticalSubjects} dari ${overallStats.totalSubjects} mata pelajaran`, 55, yPos + 25);
    doc.text('memerlukan perhatian khusus', 55, yPos + 32);
    
    // List mata pelajaran kritis
    const criticalList = semesters
      .flatMap(s => s.subjects.filter(subj => subj.score < subj.kkm))
      .slice(0, 3)
      .map(subj => subj.name.substring(0, 20))
      .join(', ');
    
    doc.setFontSize(8);
    doc.setTextColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
    doc.text('Prioritas: ' + criticalList + (overallStats.criticalSubjects > 3 ? '...' : ''), 55, yPos + 40);
    
    yPos += 65;
  }

  // Card: Rekomendasi Strategis
  doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2], 0.1);
  doc.roundedRect(20, yPos, pageWidth - 40, 60, 8, 8, 'F');
  doc.setDrawColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.setLineWidth(1);
  doc.roundedRect(20, yPos, pageWidth - 40, 60, 8, 8);
  
  doc.setFontSize(24);
  doc.text('💡', 35, yPos + 35);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.text('REKOMENDASI STRATEGIS', 55, yPos + 15);
  
  const recommendations = [
    'Fokus pada pemahaman konsep dasar materi sulit',
    'Tingkatkan frekuensi latihan soal pada area lemah',
    'Manfaatkan sumber belajar tambahan dan digital',
    'Diskusikan kesulitan dengan pengajar secara rutin',
    'Atur jadwal belajar yang seimbang dan konsisten'
  ];
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  recommendations.forEach((rec, index) => {
    doc.text(`• ${rec}`, 55, yPos + 25 + (index * 7), { maxWidth: pageWidth - 80 });
  });

  yPos += 75;

  // Card: Proyeksi & Target
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2], 0.1);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 8, 8, 'F');
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.setLineWidth(1);
  doc.roundedRect(20, yPos, pageWidth - 40, 60, 8, 8);
  
  doc.setFontSize(24);
  doc.text('🎯', 35, yPos + 30);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.text('PROYEKSI & TARGET', 55, yPos + 15);
  
  const targetAverage = Math.min(overallStats.average + 5, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(`Target Rata-rata: ${targetAverage.toFixed(1)} (+${(targetAverage - overallStats.average).toFixed(1)} poin)`, 55, yPos + 27);
  doc.text(`Target Critical Subjects: ${Math.floor(overallStats.criticalSubjects / 2)} dari ${overallStats.criticalSubjects}`, 55, yPos + 35);
  doc.text(`Timeline: 3 bulan ke depan`, 55, yPos + 43);

  // ========== FOOTER ELEGAN SETIAP HALAMAN ==========
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Garis footer tipis
    doc.setDrawColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.setLineWidth(0.3);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    // Logo kecil kiri
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text('RAPOR AGIT', 25, pageHeight - 12);
    
    // Info halaman tengah
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Halaman ${i} dari ${totalPages} • ${formattedDate}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // Watermark kanan
    doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.setFontSize(7);
    doc.text('Dokumen Akademik Resmi', pageWidth - 25, pageHeight - 12, { align: 'right' });
  }

  // ========== HALAMAN TERAKHIR: DOKUMEN RESMI ==========
  doc.addPage();
  
  // Background halus
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Box dokumen resmi
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(2);
  doc.roundedRect(30, 40, pageWidth - 60, pageHeight - 80, 10, 10, 'FD');
  
  // Judul
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text('DOKUMEN RESMI', pageWidth / 2, 70, { align: 'center' });
  
  // Konten
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  const officialText = [
    'Laporan ini merupakan dokumen resmi analisis akademik yang dibuat berdasarkan data nilai',
    'yang diinputkan secara manual. Dokumen ini bertujuan untuk memberikan gambaran',
    'komprehensif mengenai perkembangan akademik siswa.',
    '',
    '✅ Disusun berdasarkan data aktual',
    '✅ Analisis menggunakan metode standar',
    '✅ Rekomendasi berbasis data',
    '✅ Dokumen valid hingga periode berikutnya',
    '',
    `Siswa: ${options.studentName || 'Siswa'}`,
    `Sekolah: ${options.schoolName || 'Nama Sekolah'}`,
    `Dicetak: ${formattedDate} pukul ${formattedTime}`,
    '',
    'Dokumen ini dapat digunakan sebagai referensi dalam:',
    '• Evaluasi perkembangan akademik',
    '• Perencanaan pembelajaran',
    '• Konsultasi dengan tenaga pendidik',
    '• Dokumentasi pencapaian siswa'
  ];
  
  officialText.forEach((line, index) => {
    doc.text(line, pageWidth / 2, 90 + (index * 8), { align: 'center' });
  });
  
  // Tanda tangan simbolis
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 50, pageHeight - 80, pageWidth / 2 + 50, pageHeight - 80);
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Sistem Analisis Akademik Rapor Agit', pageWidth / 2, pageHeight - 70, { align: 'center' });

  // ========== SIMPAN PDF ==========
  const filename = `Analisis_Akademik_${options.studentName?.replace(/\s+/g, '_') || 'Siswa'}_${currentDate.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  
  return filename;
};