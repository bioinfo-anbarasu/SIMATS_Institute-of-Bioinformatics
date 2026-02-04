import React, { useState } from 'react';
import DataUpload from '../components/DataUpload';
import { Download, Cloud, Check, Loader2, Copy } from 'lucide-react';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';
import { savePlotToCloud } from '../services/plotService';

// Define common props for all plots
export interface BasePlotProps {
    data: any[];
    fileName: string;
}

// Helper generic component for a plot page
interface PlotPageProps {
    title: string;
    description: string;
    requiredColumns: string[];
    defaultData: any[]; // Demo data
    onDataUpdate: (data: any[], fileName: string) => void;
    data: any[];
    fileName: string | null;
    // Render function for the specific plot
    renderPlot: (data: any[], layoutProps: any) => React.ReactNode;
}

export const PlotPage: React.FC<PlotPageProps> = ({
    title, description, requiredColumns, defaultData,
    onDataUpdate, data, fileName, renderPlot
}) => {
    const [saving, setSaving] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(null);

    const handleUseSample = () => {
        onDataUpdate(defaultData, "sample_data.csv");
    };

    const handleSaveToCloud = async () => {
        if (data.length === 0) return;
        setSaving(true);
        try {
            // We save the 'title' as plotType usually, or pass it explicitly if needed
            // For now simpler to use title as type discriminator or add prop
            const id = await savePlotToCloud(title, data, fileName || 'untitled.csv');
            setSavedId(id);
        } catch (error) {
            console.error(error);
            alert("Failed to save to cloud");
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        if (savedId) {
            navigator.clipboard.writeText(savedId);
            alert("Plot ID copied to clipboard!");
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 border-b border-slate-200/60 pb-4 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <p className="text-slate-500 mt-1">{description}</p>
                </div>
                <div className="flex gap-4 items-center">
                    {savedId && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200 cursor-pointer hover:bg-green-200 transition-colors" onClick={copyToClipboard} title="Click to copy ID">
                            <Check className="w-3 h-3" />
                            <span>Saved: {savedId.slice(0, 8)}...</span>
                            <Copy className="w-3 h-3 ml-1 opacity-50" />
                        </div>
                    )}
                    <button
                        onClick={handleUseSample}
                        className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                        Load Sample Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-white/40 p-4 rounded-xl border border-white/60">
                        <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Data Input</h3>
                        <DataUpload onDataLoaded={(d, f) => { onDataUpdate(d, f); setSavedId(null); }} requiredColumns={requiredColumns} />
                        {fileName && (
                            <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Loaded: {fileName}
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-800">
                            <strong>Tip:</strong> Ensure your CSV headers match the required columns exactly.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-xl shadow-inner border border-slate-200 p-4 flex flex-col relative overflow-hidden">
                    {/* Toolbar Overlay for Save */}
                    {data.length > 0 && (
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button
                                onClick={handleSaveToCloud}
                                disabled={saving}
                                className="glass-button flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                                {saving ? 'Saving...' : 'Save Cloud'}
                            </button>
                        </div>
                    )}

                    {/* Plot Area */}
                    {data.length > 0 ? (
                        <div className="flex-1 w-full h-full min-h-[500px]">
                            {renderPlot(data, {
                                autosize: true,
                                useResizeHandler: true,
                                style: { width: '100%', height: '100%' },
                                config: {
                                    responsive: true,
                                    displaylogo: false,
                                    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toImage'],
                                    modeBarButtonsToAdd: [
                                        {
                                            name: 'Download PNG',
                                            icon: {
                                                width: 512, height: 512,
                                                path: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-60l92 104 92-104h-60V140h-64z"
                                            },
                                            click: function (gd: any) {
                                                const P = (window as any).Plotly;
                                                if (P) {
                                                    P.downloadImage(gd, { format: 'png', filename: `${title}_srplot`, height: 800, width: 1200, scale: 2 });
                                                }
                                            }
                                        },
                                        {
                                            name: 'Download SVG',
                                            icon: {
                                                width: 512, height: 512,
                                                path: "M384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1zM192 336v-32c0-8.8-7.2-16-16-16h-64v-64h64c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16v144c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16zM0 128C0 92.7 28.7 64 64 64H256V8c0-4.4 3.6-8 8-8h19.1c2.1 0 4.2 .8 5.7 2.3l120 120c1.5 1.5 2.3 3.6 2.3 5.7V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"
                                            },
                                            click: function (gd: any) {
                                                const P = (window as any).Plotly;
                                                if (P) {
                                                    P.downloadImage(gd, { format: 'svg', filename: `${title}_srplot`, height: 800, width: 1200, scale: 2 });
                                                }
                                            }
                                        }
                                    ]
                                }
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                <Download className="w-6 h-6 opacity-20" />
                            </div>
                            <p>Upload data or load sample to generate plot</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
