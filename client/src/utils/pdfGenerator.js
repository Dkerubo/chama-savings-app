// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateContributionStatement = (contributions, user, group) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(`Contribution Statement for ${group.name}`, 15, 20);
  
  // User info
  doc.setFontSize(12);
  doc.text(`Member: ${user.username}`, 15, 30);
  doc.text(`Period: ${new Date().toLocaleDateString()}`, 15, 40);
  
  // Table
  const tableData = contributions.map(cont => [
    cont.date,
    `$${cont.amount.toFixed(2)}`,
    cont.status
  ]);
  
  doc.autoTable({
    head: [['Date', 'Amount', 'Status']],
    body: tableData,
    startY: 50,
  });
  
  // Total
  const total = contributions.reduce((sum, cont) => sum + cont.amount, 0);
  doc.text(`Total Contributions: $${total.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 20);
  
  doc.save(`contributions_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`);
};