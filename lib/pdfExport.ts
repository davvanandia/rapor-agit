import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 190; // Lebar gambar di PDF
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
};

export const generateReportPDF = async (data: any, filename: string) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('LAPORAN ANALISIS RAPOR AGIT', 105, 15, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`Dibuat oleh: Davina Anandia`, 105, 25, { align: 'center' });
  pdf.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 32, { align: 'center' });
  
  let yPos = 45;
  
  // Statistik Ringkasan
  pdf.setFontSize(14);
  pdf.text('STATISTIK RINGKASAN', 20, yPos);
  yPos += 10;
  
  pdf.setFontSize(10);
  pdf.text(`Rata-rata Keseluruhan: ${data.overallAverage}`, 20, yPos);
  yPos += 7;
  pdf.text(`Total Skor: ${data.totalScore.toLocaleString('id-ID')}`, 20, yPos);
  yPos += 7;
  pdf.text(`Semester Terisi: ${data.completedSemesters}/5`, 20, yPos);
  yPos += 7;
  pdf.text(`Total Mata Pelajaran: ${data.totalSubjects}`, 20, yPos);
  yPos += 7;
  pdf.text(`Critical Subjects: ${data.criticalSubjects}`, 20, yPos);
  yPos += 12;
  
  // Detail per Semester
  pdf.setFontSize(14);
  pdf.text('DETAIL PER SEMESTER', 20, yPos);
  yPos += 10;
  
  pdf.setFontSize(10);
  data.semesters.forEach((semester: any, index: number) => {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.text(`Semester ${semester.id} (${semester.classLabel})`, 20, yPos);
    yPos += 7;
    pdf.text(`  Rata-rata: ${semester.average.toFixed(2)} | Total Skor: ${semester.totalScore.toLocaleString('id-ID')}`, 25, yPos);
    yPos += 7;
    pdf.text(`  Mata Pelajaran: ${semester.subjectsCount} | Critical: ${semester.criticalCount}`, 25, yPos);
    yPos += 10;
  });
  
  // Rekomendasi
  pdf.setFontSize(14);
  if (yPos > 230) {
    pdf.addPage();
    yPos = 20;
  }
  pdf.text('REKOMENDASI', 20, yPos);
  yPos += 10;
  
  pdf.setFontSize(10);
  const recommendations = [
    `Rata-rata keseluruhan: ${data.overallAverage}`,
    data.overallAverage >= 85 ? 'Prestasi sangat baik! Pertahankan konsistensi.' :
    data.overallAverage >= 75 ? 'Prestasi baik. Tingkatkan mata pelajaran yang masih rendah.' :
    'Perlu peningkatan fokus pada materi yang kurang dikuasai.',
    data.criticalSubjects > 0 ? `Perhatian khusus: ${data.criticalSubjects} mata pelajaran di bawah KKM.` :
    'Semua mata pelajaran sudah mencapai KKM. Bagus!'
  ];
  
  recommendations.forEach((rec, index) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.text(`${index + 1}. ${rec}`, 20, yPos);
    yPos += 7;
  });
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('© Rapor Agit - Dibuat oleh Davina Anandia', 105, 285, { align: 'center' });
  
  pdf.save(`${filename}.pdf`);
};