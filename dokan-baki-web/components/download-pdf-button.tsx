'use client';

import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DownloadPDFButtonProps {
    title: string;
    filename: string;
    headers: string[];
    data: (string | number)[][];
    orientation?: 'portrait' | 'landscape';
    footer?: string;
}

export default function DownloadPDFButton({ title, filename, headers, data, orientation = 'portrait', footer }: DownloadPDFButtonProps) {

    const handleDownload = () => {
        const doc = new jsPDF({ orientation });

        // Title
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        // Date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Table
        autoTable(doc, {
            head: [headers],
            body: data,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
        });

        // Footer
        if (footer) {
            const finalY = (doc as any).lastAutoTable.finalY || 35;
            doc.setFontSize(12);
            doc.text(footer, 14, finalY + 10);
        }

        doc.save(`${filename}.pdf`);
    };

    return (
        <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
            <FileDown className="w-4 h-4" />
            Download PDF
        </button>
    );
}
