import React, { useState } from 'react';
import { PieChart, BarChart2, Grid, Layers, Database, CloudDownload, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export type PlotType = 'pie' | 'bar' | 'heatmap' | 'go';

interface SidebarProps {
    currentPlot: PlotType;
    onSelectPlot: (plot: PlotType) => void;
    onLoadCloudPlot: (id: string) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPlot, onSelectPlot, onLoadCloudPlot }) => {
    const [loadId, setLoadId] = useState('');
    const [loading, setLoading] = useState(false);

    const plots = [
        { id: 'pie', name: '2D Pie Plot', icon: PieChart },
        { id: 'bar', name: 'Gene Up/Down Bar', icon: BarChart2 },
        { id: 'heatmap', name: 'Cluster Heatmap', icon: Grid },
        { id: 'go', name: 'GO Enrichment Bar', icon: Layers },
    ] as const;

    const handleLoad = async () => {
        if (!loadId.trim()) return;
        setLoading(true);
        try {
            await onLoadCloudPlot(loadId.trim());
            setLoadId('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className="w-64 flex-shrink-0 h-screen sticky top-0 p-4">
            <div className="glass-panel h-full flex flex-col p-4">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                        <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-slate-800">SRPLOT Lite</h1>
                        <p className="text-xs text-slate-500">Bioinformatics Plots</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    {plots.map((plot) => {
                        const Icon = plot.icon;
                        return (
                            <div
                                key={plot.id}
                                onClick={() => onSelectPlot(plot.id)}
                                className={clsx(
                                    'glass-sidebar-item',
                                    currentPlot === plot.id && 'active'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{plot.name}</span>
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4 border-t border-slate-200/50 space-y-3">
                    <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                        <div className="flex items-center gap-2 mb-2 text-slate-600">
                            <CloudDownload className="w-4 h-4" />
                            <span className="text-xs font-semibold">Load Cloud Plot</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={loadId}
                                onChange={(e) => setLoadId(e.target.value)}
                                type="text"
                                placeholder="Enter Plot ID..."
                                className="w-full text-xs px-2 py-1.5 rounded glass-input bg-white/80"
                            />
                            <button
                                onClick={handleLoad}
                                disabled={loading || !loadId}
                                className="bg-blue-600 text-white rounded p-1.5 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-center text-slate-400">
                        Publication Quality Export
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
