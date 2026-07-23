/**
 * @fileoverview PDF export and QR code utilities for Authenticity Reports.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#1E1B2E',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

export function generateBadgeText(reportId: string, score: number): string {
  return `CREATIVE ALIBI VERIFIED\nReport: ${reportId.toUpperCase()}\nScore: ${score}/100\nVerify: https://creative-alibi.app/verify/${reportId}`;
}
