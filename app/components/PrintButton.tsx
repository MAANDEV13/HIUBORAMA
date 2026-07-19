'use client';

export default function PrintButton() {
    return (
        <button
            className="print:hidden px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            onClick={() => window.print()}
        >
            Print Transcript
        </button>
    );
}
