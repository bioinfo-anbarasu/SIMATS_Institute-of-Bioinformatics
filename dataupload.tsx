import React, { useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

interface DataUploadProps {
    onDataLoaded: (data: any[], fileName: string) => void;
    requiredColumns?: string[];
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataLoaded, requiredColumns }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);

        if (!file) return;

        // Accept any text-based format
        if (file.type !== 'text/csv' && !file.name.match(/\.(csv|tsv|txt)$/i)) {
            setError('Please upload a CSV, TSV, or TXT file.');
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                if (results.errors.length > 0 && results.errors[0].type !== 'Delimiter') {
                    // Ignore delimiter errors as PapaParse sometimes flakily reports them on good files
                    setError(`Error parsing file: ${results.errors[0].message}`);
                    return;
                }

                const data = results.data;
                if (!data || data.length === 0) {
                    setError("File is empty.");
                    return;
                }

                // Removed strict validation. Just log warning if needed.
                if (requiredColumns) {
                    const headers = Object.keys(data[0] as any);
                    const missing = requiredColumns.filter(col => !headers.includes(col));
                    if (missing.length > 0) {
                        console.warn(`Missing potential columns: ${missing.join(', ')}`);
                    }
                }

                onDataLoaded(data, file.name);
            },
            error: (err) => {
                setError(`Failed to read file: ${err.message}`);
            }
        });
    };

    return (
        <div className="mb-6">
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
                <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                    <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Click to upload your data (CSV/TSV)</p>
                <p className="text-xs text-slate-500 mt-1">
                    Accepts: ID | adj.P.Val | P.Value | t | B | logFC | Gene.symbol | Gene.title
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                />
            </div>

            {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default DataUpload;
