import type { FC } from 'react';
import Plot from 'react-plotly.js';
import { PlotPage } from '../components/PlotPage';

interface GoBarPlotProps {
    onDataUpdate: (data: any[], fileName: string) => void;
    data: any[];
    fileName: string | null;
}

const SAMPLE_GO_DATA = [
    { 'Gene.title': 'DNA replication', 'Gene.symbol': 'BP', logFC: 25 },
    { 'Gene.title': 'Cell division', 'Gene.symbol': 'BP', logFC: 20 },
    { 'Gene.title': 'Nucleus', 'Gene.symbol': 'CC', logFC: 35 },
    { 'Gene.title': 'Cytoplasm', 'Gene.symbol': 'CC', logFC: 28 },
    { 'Gene.title': 'ATP binding', 'Gene.symbol': 'MF', logFC: 15 },
    { 'Gene.title': 'DNA binding', 'Gene.symbol': 'MF', logFC: 30 },
];

const GoBarPlot: FC<GoBarPlotProps> = (props) => {
    return (
        <PlotPage
            title="GO Enrichment Bar Plot"
            description="Visualizes enrichment. (Mapping: logFC -> Count, Gene.symbol -> Cat, Gene.title -> Term)"
            requiredColumns={['ID', 'adj.P.Val', 'P.Value', 't', 'B', 'logFC', 'Gene.symbol', 'Gene.title']}
            defaultData={SAMPLE_GO_DATA}
            {...props}
            renderPlot={(data, commonConfig) => {
                if (!data.length) return null;
                const keys = Object.keys(data[0]);

                // Auto-mapping heuristics for TOpTable format acting as GO? 
                // Or user just wants standard columns for everything.
                // We will try to find logic:
                // Value/Count = logFC (as proxy for magnitude) or adj.P.Val (inverse?)
                // Group = Gene.symbol (just for grouping) or 'category'
                // Label = Gene.title

                let countKey = keys.find(k => ['logFC', 't', 'B'].includes(k)) || keys.find(k => typeof data[0][k] === 'number') || keys[0];
                let termKey = keys.find(k => ['Gene.title', 'ID'].includes(k)) || keys.find(k => typeof data[0][k] === 'string') || keys[0];
                let catKey = keys.find(k => ['Gene.symbol', 'category'].includes(k)) || termKey;

                // Group by category but limited groups to avoid chaos if it's actually gene data
                const uniqueCats = [...new Set(data.map(d => d[catKey]))].slice(0, 50); // Limit groups

                const colors = ['#E15759', '#4E79A7', '#F28E2B', '#76B7B2', '#59A14F'];

                const traces = uniqueCats.map((cat, i) => {
                    const catData = data.filter(d => d[catKey] === cat).sort((a, b) => a[countKey] - b[countKey]);
                    if (catData.length === 0) return null;

                    return {
                        x: catData.map(d => d[countKey]),
                        y: catData.map(d => d[termKey]),
                        name: cat || 'Terms',
                        type: 'bar',
                        orientation: 'h',
                        marker: { color: colors[i % colors.length] }
                    };
                }).filter(Boolean);

                return (
                    <Plot
                        data={traces as any}
                        layout={{
                            title: { text: "Enrichment / Expression", font: { size: 20 } },
                            xaxis: { title: countKey },
                            yaxis: { dtick: 1, automargin: true },
                            barmode: 'group',
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            margin: { l: 200 },
                            height: Math.max(500, data.length * 20 + 100),
                            showlegend: true
                        }}
                        {...commonConfig}
                    />
                );
            }}
        />
    );
};

export default GoBarPlot;
