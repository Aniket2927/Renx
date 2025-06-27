import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const TestChart = () => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    console.log("TestChart component mounted");
    
    if (!chartContainerRef.current) {
      console.error("Chart container ref is null");
      return;
    }

    try {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });

      console.log("Chart created successfully:", chart);

      const lineSeries = chart.addLineSeries();
      lineSeries.setData([
        { time: '2019-04-11', value: 80.01 },
        { time: '2019-04-12', value: 96.63 },
        { time: '2019-04-13', value: 76.64 },
        { time: '2019-04-14', value: 81.89 },
        { time: '2019-04-15', value: 74.43 },
        { time: '2019-04-16', value: 80.01 },
        { time: '2019-04-17', value: 96.63 },
        { time: '2019-04-18', value: 76.64 },
        { time: '2019-04-19', value: 81.89 },
        { time: '2019-04-20', value: 74.43 },
      ]);

      console.log("Line series data set successfully");

      chart.timeScale().fitContent();

      console.log("Chart time scale adjusted");

      return () => {
        console.log("Cleaning up chart");
        chart.remove();
      };
    } catch (error) {
      console.error("Error creating chart:", error);
    }
  }, []);

  return (
    <div>
      <h3>Test Chart</h3>
      <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
    </div>
  );
};

export default TestChart; 