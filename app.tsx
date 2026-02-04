import { useState } from 'react';
import Layout from './components/Layout';
import Sidebar, { type PlotType } from './components/Sidebar';
import PiePlot from './plots/PiePlot';
import GeneBarPlot from './plots/GeneBarPlot';
import HeatmapPlot from './plots/HeatmapPlot';
import GoBarPlot from './plots/GoBarPlot';

import { loadPlotFromCloud } from './services/plotService';

function App() {
  const [currentPlot, setCurrentPlot] = useState<PlotType>('pie');
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePlotChange = (plot: PlotType) => {
    setCurrentPlot(plot);
    // Reset data when switching plot types to ensure clean state
    setData([]);
    setFileName(null);
  };

  const handleDataUpdate = (newData: any[], newFileName: string) => {
    setData(newData);
    setFileName(newFileName);
  };

  const handleLoadCloudPlot = async (id: string) => {
    try {
      const plot = await loadPlotFromCloud(id);
      if (plot) {
        console.log("Loaded plot:", plot);
        // Need to map title back to ID
        let type: PlotType = 'pie';
        if (plot.plotType.includes('Pie')) type = 'pie';
        else if (plot.plotType.includes('Gene')) type = 'bar';
        else if (plot.plotType.includes('Heatmap')) type = 'heatmap';
        else if (plot.plotType.includes('GO')) type = 'go';


        setCurrentPlot(type);
        setData(plot.data);
        setFileName(plot.fileName);
      } else {
        alert('Plot not found with that ID');
      }
    } catch (e) {
      console.error(e);
      alert('Error loading plot');
    }
  };

  const renderCurrentPlot = () => {
    const props = {
      onDataUpdate: handleDataUpdate,
      data: data,
      fileName: fileName
    };

    switch (currentPlot) {
      case 'pie': return <PiePlot {...props} />;
      case 'bar': return <GeneBarPlot {...props} />;
      case 'heatmap': return <HeatmapPlot {...props} />;
      case 'go': return <GoBarPlot {...props} />;

      default: return <div>Select a plot</div>;
    }
  };

  return (
    <Layout
      sidebar={
        <Sidebar
          currentPlot={currentPlot}
          onSelectPlot={handlePlotChange}
          onLoadCloudPlot={handleLoadCloudPlot}
        />
      }
    >
      {renderCurrentPlot()}
    </Layout>
  );
}

export default App;
