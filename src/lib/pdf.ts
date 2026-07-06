import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadTablePdf(options: {
  title: string;
  subtitle?: string;
  head: string[];
  rows: (string | number)[][];
  fileName: string;
}) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(options.title, 14, 18);

  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(options.subtitle, 14, 25);
  }

  autoTable(doc, {
    startY: options.subtitle ? 32 : 26,
    head: [options.head],
    body: options.rows,
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
  });

  doc.save(options.fileName);
}
