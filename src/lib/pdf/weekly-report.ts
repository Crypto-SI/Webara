import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ChecklistItem, ReportData } from '@/types/weekly-tracker';

const DAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

const PLATFORM_COLORS: Record<string, [number, number, number]> = {
  linkedin: [0, 119, 181],
  instagram: [225, 48, 108],
  x: [0, 0, 0],
  youtube: [255, 0, 0],
  ads: [66, 133, 244],
  website: [34, 197, 94],
  analytics: [168, 85, 247],
  operations: [249, 115, 22],
  planning: [234, 179, 8],
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function generateWeeklyReportPDF(data: ReportData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // ── Header ──────────────────────────────────────────────────────────
  // Dark header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Webara branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('WEBARA', margin, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Weekly Marketing Execution Report', margin, 22);

  // Date range on the right
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const dateRange = `${formatDate(data.weekStartDate)} – ${formatDate(data.weekEndDate)}`;
  const dateWidth = doc.getTextWidth(dateRange);
  doc.text(dateRange, pageWidth - margin - dateWidth, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const generatedText = `Generated: ${formatTimestamp(new Date().toISOString())}`;
  const genWidth = doc.getTextWidth(generatedText);
  doc.text(generatedText, pageWidth - margin - genWidth, 22);

  yPos = 40;

  // ── Summary Section ─────────────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', margin, yPos);
  yPos += 8;

  // Summary cards
  const cardWidth = (pageWidth - margin * 2 - 10) / 3;
  const summaryCards = [
    {
      label: 'Completion Rate',
      value: `${data.summary.completion_rate}%`,
      color: data.summary.completion_rate >= 80 ? [34, 197, 94] : data.summary.completion_rate >= 50 ? [234, 179, 8] : [239, 68, 68],
    },
    {
      label: 'Tasks Completed',
      value: `${data.summary.completed_tasks}/${data.summary.total_tasks}`,
      color: [59, 130, 246],
    },
    {
      label: 'Committed At',
      value: formatTimestamp(data.summary.committed_at),
      color: [107, 114, 128],
    },
  ];

  for (let i = 0; i < summaryCards.length; i++) {
    const card = summaryCards[i];
    const x = margin + i * (cardWidth + 5);

    // Card background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(x, yPos, cardWidth, 22, 2, 2, 'F');

    // Left color accent
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.rect(x, yPos, 3, 22, 'F');

    // Label
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + 7, yPos + 8);

    // Value
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    // Use a compact format for the committed-at card to avoid truncation artifacts
    const displayValue = card.label === 'Committed At'
      ? card.value.replace(/:\d{2}\s/, ' ') // drop seconds
      : card.value.length > 22
        ? card.value.slice(0, 20) + '…'
        : card.value;
    doc.text(displayValue, x + 7, yPos + 17);
  }

  yPos += 30;

  // ── Platform Summary ────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Platform Breakdown', margin, yPos);
  yPos += 4;

  const breakdown = data.summary.breakdown_json ?? { by_platform: {}, by_day: {} };
  const platformRows = Object.entries(breakdown.by_platform ?? {})
    .sort(([, a], [, b]) => b.completion_rate - a.completion_rate)
    .map(([platform, stats]) => [
      platform.charAt(0).toUpperCase() + platform.slice(1),
      `${stats.completed}/${stats.total}`,
      `${stats.completion_rate}%`,
    ]);

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [['Platform', 'Completed', 'Rate']],
    body: platformRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'center', cellWidth: 30 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ── Per-Day Breakdown ───────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Daily Task Breakdown', margin, yPos);
  yPos += 4;

  const groupedByDay: Record<number, ChecklistItem[]> = {};
  for (const item of data.items) {
    if (!groupedByDay[item.day_of_week]) groupedByDay[item.day_of_week] = [];
    groupedByDay[item.day_of_week].push(item);
  }

  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    const dayItems = groupedByDay[dayNum];
    if (!dayItems || dayItems.length === 0) continue;

    const dayName = DAY_NAMES[dayNum];
    const dayStats = breakdown.by_day[String(dayNum)];
    const dayRate = dayStats ? `${dayStats.completion_rate}%` : 'N/A';

    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    // Day header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${dayName}  (${dayRate})`, margin, yPos);
    yPos += 2;

    const dayRows = dayItems.map((item) => {
      const status = item.completed ? '✓ Done' : '✗ Not Done';
      return [
        item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
        item.task_label,
        status,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      head: [['Platform', 'Task', 'Status']],
      body: dayRows,
      theme: 'plain',
      headStyles: {
        fillColor: [241, 245, 249], // slate-100
        textColor: [71, 85, 105], // slate-600
        fontStyle: 'bold',
        fontSize: 7,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
      },
      didParseCell: (hookData: any) => {
        // Color the status column
        if (hookData.section === 'body' && hookData.column.index === 2) {
          const cellText = hookData.cell.raw as string;
          if (cellText.startsWith('✓')) {
            hookData.cell.styles.textColor = [22, 163, 74]; // green-600
            hookData.cell.styles.fontStyle = 'bold';
          } else {
            hookData.cell.styles.textColor = [220, 38, 38]; // red-600
          }
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── Footer ──────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Footer text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Webara Weekly Marketing Report — Week of ${formatDate(data.weekStartDate)}`,
      margin,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - 7
    );
  }

  return doc;
}

export function downloadWeeklyReportPDF(data: ReportData): void {
  const doc = generateWeeklyReportPDF(data);
  const filename = `webara-weekly-report-${data.weekStartDate}.pdf`;
  doc.save(filename);
}
