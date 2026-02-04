import type { FC } from 'react';
import Plot from 'react-plotly.js';
import { PlotPage } from '../components/PlotPage';

interface PiePlotProps {
    onDataUpdate: (data: any[], fileName: string) => void;
    data: any[];
    fileName: string | null;
}

const SAMPLE_DATA = [
    { 'Gene.symbol': 'Coding', value: 120 },
    { 'Gene.symbol': 'Non-coding', value: 80 },
    { 'Gene.symbol': 'Antisense', value: 45 },
    { 'Gene.symbol': 'Pseudogene', value: 30 },
    { 'Gene.symbol': 'miRNA', value: 15 },
];

const PiePlot: FC<PiePlotProps> = (props) => {
    return (
        <PlotPage
            title="2D Pie Plot"
            description="Proportional slicing using standard expression data."
            requiredColumns={['ID', 'adj.P.Val', 'P.Value', 't', 'B', 'logFC', 'Gene.symbol', 'Gene.title']}
            defaultData={SAMPLE_DATA}
            {...props}
            renderPlot={(data, commonConfig) => {
                if (!data.length) return null;
                const keys = Object.keys(data[0]);

                // Auto-map columns
                // Label: Gene.symbol > Gene.title > ID > first string
                let catKey = keys.find(k => ['Gene.symbol', 'Gene.title', 'ID', 'category'].includes(k))
                    || keys.find(k => typeof data[0][k] === 'string')
                    || keys[0];

                // Value: logFC > t > B > P.Value > first number
                let valKey = keys.find(k => ['logFC', 't', 'B', 'P.Value', 'value'].includes(k))
                    || keys.find(k => typeof data[0][k] === 'number')
                    || keys[1];

                const categories = data.map(d => d[catKey]);
                // For Pie chart, values should be positive usually. If using logFC, take abs? 
                // Or if user sketches distribution of 'B' statistic. We use raw value but warn if negative?
                // Plotly handles negatives by ignoring or absolute? Pie slices can't be negative.
                // We'll take Math.abs for logFC since it represents magnitude of change often desired in this context
                const values = data.map(d => Math.abs(Number(d[valKey]) || 0));

                return (
                    <Plot
                        data={[
                            {
                                labels: categories,
                                values: values,
                                type: 'pie',
                                textinfo: 'label+percent',
                                hoverinfo: 'label+value+percent',
                                textposition: 'inside',
                                marker: {
                                    colors: [
                                        '#4C78A8', '#9EC5E9', '#F58518', '#FFBF79',
                                        '#54A24B', '#8CD17D', '#B279A2', '#FF9DA6'
                                    ]
                                }
                            }
                        ]}
                        layout={{
                            title: { text: `Distribution of ${valKey}`, font: { size: 24 } },
                            showlegend: true,
                            legend: { title: { text: catKey }, x: 1, y: 0.5 },
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            margin: { t: 50, b: 50, l: 50, r: 50 },
                        }}
                        {...commonConfig}
                    />
                );
            }}
        />
    );
};

export default PiePlot;
