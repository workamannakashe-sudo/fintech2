import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillSplit, FinancialHealthScore, StudentProfile, Transaction } from '../types';

/**
 * Generate a student monthly financial health report PDF
 */
export function generateMonthlyHealthPdf(
  profile: StudentProfile,
  health: FinancialHealthScore,
  transactions: Transaction[],
  monthName: string,
  year: number
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(15, 118, 110); // Teal
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('BudgetMitra', 14, 18);
  doc.setFontSize(10);
  doc.text('Student Monthly Financial Health & Expense Report', 14, 26);
  doc.text(`${monthName} ${year} | 100% On-Device & Private`, 14, 32);

  // Student Profile Card
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text('Student Profile', 14, 46);

  doc.setFontSize(10);
  doc.text(`Name: ${profile.name}`, 14, 53);
  doc.text(`Course: ${profile.course} (${profile.year})`, 14, 59);
  doc.text(`State: ${profile.state} | Category: ${profile.category}`, 14, 65);
  doc.text(`Monthly Allowance: Rs. ${profile.monthlyAllowance.toLocaleString('en-IN')}`, 14, 71);

  // Health Score Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(120, 42, 76, 32, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(120, 42, 76, 32, 3, 3, 'S');

  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('Financial Health Score', 126, 50);
  doc.setFontSize(22);
  doc.text(`${health.overallScore} / 100`, 126, 62);
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11);
  doc.text(`Grade: ${health.grade}`, 165, 62);

  // Pillar Scores Table
  const pillarRows = [
    ['Savings Rate Pillar', `${health.savingsRateScore} / 25`, `${health.savingsRatePercentage}% of allowance preserved`],
    ['Budget Adherence Pillar', `${health.budgetAdherenceScore} / 25`, 'Category envelope spending discipline'],
    ['Anomaly & Risk Pillar', `${health.anomalyRiskScore} / 25`, 'Absence of unusual 2x+ spending spikes'],
    ['Logging Consistency', `${health.consistencyScore} / 25`, 'Daily transaction tracking frequency']
  ];

  autoTable(doc, {
    startY: 80,
    head: [['Assessment Pillar', 'Score', 'Status']],
    body: pillarRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110] },
    styles: { fontSize: 9 }
  });

  // Recent Transactions Breakdown
  const debits = transactions.filter((t) => t.type === 'debit');
  const totalSpent = debits.reduce((acc, t) => acc + t.amount, 0);

  const txRows = debits.slice(0, 20).map((t) => [
    t.date,
    t.category,
    t.merchant || t.note || 'Expense',
    t.source.toUpperCase(),
    `Rs. ${t.amount.toLocaleString('en-IN')}`
  ]);

  const lastTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(`Monthly Expenses (Total Spent: Rs. ${totalSpent.toLocaleString('en-IN')})`, 14, lastTableY + 12);

  autoTable(doc, {
    startY: lastTableY + 16,
    head: [['Date', 'Category', 'Description / Merchant', 'Source', 'Amount']],
    body: txRows,
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 8 }
  });

  // Footer Tip
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  if (finalY < 270) {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, finalY + 8, 182, 16, 'F');
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text(`Mitra Insight: ${health.insight}`, 18, finalY + 18);
  }

  // Save / Trigger Download
  doc.save(`BudgetMitra_Report_${monthName}_${year}.pdf`);
}

/**
 * Generate a Split Bill Receipt PDF for WhatsApp sharing or saving
 */
export function generateSplitBillPdf(split: BillSplit, upiId: string): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  // Header
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 148, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('BudgetMitra — Split Bill Invoice', 10, 14);
  doc.setFontSize(9);
  doc.text(`Event: ${split.title} | Date: ${split.date}`, 10, 22);

  // Summary
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Total Bill Amount: Rs. ${split.totalAmount.toLocaleString('en-IN')}`, 10, 38);
  doc.text(`Split Mode: ${split.splitType === 'equal' ? 'Equal Share' : 'Custom Share'}`, 10, 44);
  if (upiId) {
    doc.text(`Pay to UPI ID: ${upiId}`, 10, 50);
  }

  const rows = split.members.map((m) => [
    m.name,
    `${m.percentage}%`,
    `Rs. ${m.amount.toFixed(2)}`,
    m.paidStatus.toUpperCase()
  ]);

  autoTable(doc, {
    startY: upiId ? 56 : 50,
    head: [['Friend / Member', 'Share %', 'Amount Due', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110] },
    styles: { fontSize: 9 }
  });

  const lastTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Generated with BudgetMitra — On-device student money manager.', 10, lastTableY + 12);

  // Return Data URI string for sharing / downloading
  doc.save(`SplitBill_${split.title.replace(/\s+/g, '_')}.pdf`);
  return doc.output('datauristring');
}
