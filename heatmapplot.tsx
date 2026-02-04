import { useState, type FC } from 'react';
import Plot from 'react-plotly.js';
import { PlotPage } from '../components/PlotPage';

interface HeatmapPlotProps {
    onDataUpdate: (data: any[], fileName: string) => void;
    data: any[];
    fileName: string | null;
}

const SAMPLE_MATRIX = [
    { 'Gene.symbol': 'Gene1', Sample1: 10, Sample2: 12, Sample3: 5, Sample4: 2 },
    { 'Gene.symbol': 'Gene2', Sample1: 2, Sample2: 3, Sample3: 15, Sample4: 18 },
    { 'Gene.symbol': 'Gene3', Sample1: 8, Sample2: 9, Sample3: 6, Sample4: 7 },
    { 'Gene.symbol': 'Gene4', Sample1: 1, Sample2: 1, Sample3: 12, Sample4: 11 },
    { 'Gene.symbol': 'Gene5', Sample1: 14, Sample2: 13, Sample3: 2, Sample4: 1 },
];

const HeatmapPlot: FC<HeatmapPlotProps> = (props) => {
    const [zScore, setZScore] = useState(false);

    return (
        <PlotPage
            title="Cluster Heatmap"
            description="Visualizes expression matrix."
            requiredColumns={['ID', 'adj.P.Val', 'P.Value', 't', 'B', 'logFC', 'Gene.symbol', 'Gene.title']}
            defaultData={SAMPLE_MATRIX}
            {...props}
            renderPlot={(data, commonConfig) => {
                if (!data.length) return null;
                const keys = Object.keys(data[0]);

                // Attempt to identify row labels (Gene ID/Symbol)
                const rowLabelKey = keys.find(k => ['Gene.symbol', 'Gene.title', 'ID', 'Gene'].includes(k)) || keys[0];

                // Assume all other numeric columns are samples
                const colLabels = keys.filter(k => k !== rowLabelKey && typeof data[0][k] === 'number');

                const rowLabels = data.map(d => d[rowLabelKey]);

                let zValues = data.map(d => colLabels.map(col => parseFloat(d[col])));

                if (zScore) {
                    zValues = zValues.map(row => {
                        const mean = row.reduce((a: number, b: number) => a + b, 0) / row.length;
                        const std = Math.sqrt(row.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / row.length);
                        return row.map((v: number) => std === 0 ? 0 : (v - mean) / std);
                    });
                }

                return (
                    <div className="relative w-full h-full flex flex-col">
                        <div className="absolute top-0 right-0 z-10 p-2">
                            <label className="flex items-center gap-2 text-sm bg-white/80 p-2 rounded shadow backdrop-blur-sm cursor-pointer hover:bg-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={zScore}
                                    onChange={(e) => setZScore(e.target.checked)}
                                    className="accent-blue-600 w-4 h-4"
                                />
                                <span>Apply Z-score Normalization</span>
                            </label>
                        </div>
                        <Plot
                            data={[
                                {
                                    z: zValues,
                                    x: colLabels,
                                    y: rowLabels,
                                    type: 'heatmap',
                                    colorscale: 'RdBu',
                                    reversescale: true,
                                    showscale: true
                                }
                            ]}
                            layout={{
                                title: { text: "Expression Heatmap", font: { size: 20 } },
                                xaxis: { tickangle: -45, side: 'bottom' },
                                yaxis: { automargin: true },
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                margin: { l: 100, b: 100 }
                            }}
                            {...commonConfig}
                        />
                    </div>
                );
            }}
        />
    );
};

export default HeatmapPlot;
