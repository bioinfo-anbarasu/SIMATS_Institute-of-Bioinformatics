import type { FC } from 'react';
import Plot from 'react-plotly.js';
import { PlotPage } from '../components/PlotPage';

interface GeneBarPlotProps {
    onDataUpdate: (data: any[], fileName: string) => void;
    data: any[];
    fileName: string | null;
}

const SAMPLE_DATA = [
    { 'Gene.symbol': 'TP53', logFC: 2.5 },
    { 'Gene.symbol': 'EGFR', logFC: 1.8 },
    { 'Gene.symbol': 'MYC', logFC: 1.2 },
    { 'Gene.symbol': 'BRCA1', logFC: -0.5 },
    { 'Gene.symbol': 'PTEN', logFC: -1.5 },
    { 'Gene.symbol': 'AKT1', logFC: -2.2 },
];

const GeneBarPlot: FC<GeneBarPlotProps> = (props) => {
    return (
        <PlotPage
            title="Gene Up-Down Bar Plot"
            description="Visualizes differential expression (logFC)."
            requiredColumns={['ID', 'adj.P.Val', 'P.Value', 't', 'B', 'logFC', 'Gene.symbol', 'Gene.title']}
            defaultData={SAMPLE_DATA}
            {...props}
            renderPlot={(data, commonConfig) => {
                if (!data.length) return null;
                const keys = Object.keys(data[0]);

                // Auto-map
                let nameKey = keys.find(k => ['Gene.symbol', 'Gene.title', 'ID', 'gene_name'].includes(k))
                    || keys.find(k => typeof data[0][k] === 'string')
                    || keys[0];

                let valKey = keys.find(k => ['logFC', 'log2FoldChange', 't', 'B'].includes(k))
                    || keys.find(k => typeof data[0][k] === 'number')
                    || keys[1];

                // Sort by absolute value descending
                const sortedData = [...data].sort((a, b) => Math.abs(b[valKey]) - Math.abs(a[valKey]));

                // Split for legend
                const up = sortedData.filter(d => d[valKey] > 0);
                const down = sortedData.filter(d => d[valKey] <= 0);

                return (
                    <Plot
                        data={[
                            {
                                x: up.map(d => d[nameKey]),
                                y: up.map(d => d[valKey]),
                                type: 'bar',
                                name: 'Upregulated',
                                marker: { color: '#E15759' }, // Red
                                hovertemplate: `<b>%{x}</b><br>${valKey}: %{y:.3f}<extra></extra>`
                            },
                            {
                                x: down.map(d => d[nameKey]),
                                y: down.map(d => d[valKey]),
                                type: 'bar',
                                name: 'Downregulated',
                                marker: { color: '#59A14F' }, // Green
                                hovertemplate: `<b>%{x}</b><br>${valKey}: %{y:.3f}<extra></extra>`
                            }
                        ]}
                        layout={{
                            title: { text: "Differential Gene Expression", font: { size: 20 } },
                            yaxis: { title: valKey, zeroline: true, zerolinewidth: 2, zerolinecolor: '#333' },
                            xaxis: { title: nameKey, tickangle: -45 },
                            showlegend: true,
                            legend: { x: 1, y: 1 },
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            margin: { b: 100 }
                        }}
                        {...commonConfig}
                    />
                );
            }}
        />
    );
};

export default GeneBarPlot;
