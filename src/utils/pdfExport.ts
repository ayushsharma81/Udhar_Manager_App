import jsPDF from 'jspdf';
import { Person, Transaction } from '../types';
import { calculatePersonBalance, formatRupee } from './calculator';

export function generatePersonStatementPdf(person: Person, transactions: Transaction[]): void {
  const doc = new jsPDF();
  const summary = calculatePersonBalance(person.id, transactions, person.isSettled);
  const personTxs = transactions
    .filter((tx) => tx.personId === person.id)
    .sort((a, b) => a.date - b.date);

  // Brand Header
  doc.setFillColor(5, 150, 105); // Emerald Green
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('UDHAR MANAGER - ACCOUNT STATEMENT', 14, 15);

  // Metadata
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 140, 15);

  // Person Details Box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 32, 182, 30, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(person.name, 20, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Phone: ${person.phone} | Category: ${person.category}`, 20, 48);
  doc.text(`Status: ${person.isSettled ? 'COMPLETELY SETTLED' : 'ACTIVE LEDGER'}`, 20, 54);

  // Summary Metrics Bar
  const startY = 70;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, startY, 182, 18, 'F');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL LENT', 20, startY + 6);
  doc.text('TOTAL RECEIVED', 65, startY + 6);
  doc.text('INTEREST', 115, startY + 6);
  doc.text('OUTSTANDING', 160, startY + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupee(summary.totalLent), 20, startY + 13);
  doc.text(formatRupee(summary.totalReceived), 65, startY + 13);
  doc.text(formatRupee(summary.totalInterestAccrued), 115, startY + 13);

  const outstandingColor = summary.outstandingOwedToUser > 0 ? [5, 150, 105] : [225, 29, 72];
  doc.setTextColor(outstandingColor[0], outstandingColor[1], outstandingColor[2]);
  doc.text(
    summary.outstandingOwedToUser > 0
      ? formatRupee(summary.outstandingOwedToUser)
      : formatRupee(summary.liabilityOwedByUser),
    160,
    startY + 13
  );

  // Table Headers
  let tableY = startY + 28;
  doc.setFillColor(226, 232, 240);
  doc.rect(14, tableY, 182, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', 18, tableY + 5.5);
  doc.text('TYPE', 45, tableY + 5.5);
  doc.text('DESCRIPTION', 80, tableY + 5.5);
  doc.text('METHOD', 140, tableY + 5.5);
  doc.text('AMOUNT', 172, tableY + 5.5);

  tableY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  let runningBalance = 0;
  for (const tx of personTxs) {
    if (tableY > 270) {
      doc.addPage();
      tableY = 20;
    }

    const d = new Date(tx.date);
    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

    doc.setTextColor(51, 65, 85);
    doc.text(dateStr, 18, tableY + 5);
    doc.text(tx.type.replace('_', ' '), 45, tableY + 5);
    doc.text((tx.description || '-').substring(0, 32), 80, tableY + 5);
    doc.text(tx.paymentMethod, 140, tableY + 5);

    const isCredit = tx.type === 'LEND' || tx.type === 'INTEREST';
    if (isCredit) {
      doc.setTextColor(5, 150, 105);
      doc.text(`+${formatRupee(tx.amount)}`, 172, tableY + 5);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text(`-${formatRupee(tx.amount)}`, 172, tableY + 5);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(14, tableY + 7, 196, tableY + 7);
    tableY += 7.5;
  }

  // Footer note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a computer-generated personal ledger statement from Udhar Manager Android App.',
    14,
    285
  );

  doc.save(`${person.name.replace(/\s+/g, '_')}_Udhar_Statement.pdf`);
}
