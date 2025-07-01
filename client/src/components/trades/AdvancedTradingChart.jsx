import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  height: 400px;
  width: 100%;
  position: relative;
  background: #f0f4fa;
`;

const ChartControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const TimeframeButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const TimeframeButton = styled.button`
  background: ${props => props.active ? '#4f8cff' : 'rgba(79, 140, 255, 0.1)'};
  color: ${props => props.active ? '#fff' : '#4f8cff'};
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#4f8cff' : 'rgba(79, 140, 255, 0.2)'};
  }
`;

const ChartTypeButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const IndicatorButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const PriceInfo = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const PriceInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const PriceLabel = styled.span`
  font-size: 0.75rem;
  color: #666;
`;

const PriceValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(240, 244, 250, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #4f8cff;
  z-index: 10;
`;

const AdvancedTradingChart = ({ market }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const mainSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);
  
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('candles');
  const [showVolume, setShowVolume] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Real data states
  const [candlestickData, setCandlestickData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [emaData, setEmaData] = useState([]);
  const [totalCandlesLoaded, setTotalCandlesLoaded] = useState(0);
  const [oldestLoadedTime, setOldestLoadedTime] = useState(null);
  
  // Calculate EMA from real data
  const calculateEMA = (data, period = 20) => {
    if (!data || data.length === 0) return [];
    const k = 2 / (period + 1);
    let ema = data[0].close;
    
    return data.map(candle => {
      ema = candle.close * k + ema * (1 - k);
      return {
        time: candle.time,
        value: ema
      };
    });
  };

  // Generate volume data from candlestick data
  const generateVolumeData = (candlestickData) => {
    return candlestickData.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close > candle.open ? 'rgba(45, 255, 122, 0.5)' : 'rgba(255, 45, 122, 0.5)'
    }));
  };
  
  // Initialize chart data with real API calls
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setIsLoadingData(true);
        console.log("Fetching real market data for:", market.symbol);
        
        // Fetch real historical data
        const historicalData = await marketDataService.getTimeSeries(
          market.symbol, 
          '1day', 
          90
        );
        
        // Transform data to chart format
        const newCandlestickData = historicalData.map(item => ({
          time: Math.floor(new Date(item.x).getTime() / 1000),
          open: item.y[0],
          high: item.y[1],
          low: item.y[2],
          close: item.y[3],
          volume: item.volume || Math.floor(Math.random() * 1000000) // Fallback if volume not available
        }));
        
        if (newCandlestickData.length > 0) {
          setOldestLoadedTime(newCandlestickData[0].time);
        }
        
        setCandlestickData(newCandlestickData);
        setVolumeData(generateVolumeData(newCandlestickData));
        setEmaData(calculateEMA(newCandlestickData, 20));
        setTotalCandlesLoaded(newCandlestickData.length);
        
      } catch (error) {
        console.error('Error fetching real market data:', error);
        // Fallback to empty data
        setCandlestickData([]);
        setVolumeData([]);
        setEmaData([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (market && market.symbol) {
      fetchRealData();
    }
  }, [market]);
  
  // Function to load more historical data
  const loadMoreData = useCallback(async () => {
    if (isLoadingData || !oldestLoadedTime || !market.symbol) return;
    
    try {
      setIsLoadingData(true);
      
      // Fetch more historical data (90 more days before the oldest loaded data)
      const olderData = await marketDataService.getTimeSeries(
        market.symbol,
        '1day',
        90,
        new Date(oldestLoadedTime * 1000).toISOString().split('T')[0] // Start from oldest loaded date
      );
      
      // Transform to chart format
      const olderCandlestickData = olderData.map(item => ({
        time: Math.floor(new Date(item.x).getTime() / 1000),
        open: item.y[0],
        high: item.y[1],
        low: item.y[2],
        close: item.y[3],
        volume: item.volume || Math.floor(Math.random() * 1000000)
      }));
      
      // Update oldest time reference
      if (olderCandlestickData.length > 0) {
        setOldestLoadedTime(olderCandlestickData[0].time);
      }
      
      // Update state with the new historical data
      setCandlestickData(prevData => {
        const newData = [...olderCandlestickData, ...prevData];
        return newData;
      });
      
      setTotalCandlesLoaded(prev => prev + olderCandlestickData.length);
      
      // Update derived data
      const allData = [...olderCandlestickData, ...candlestickData];
      setVolumeData(generateVolumeData(allData));
      setEmaData(calculateEMA(allData, 20));
      
      // Update the chart series with new data
      if (mainSeriesRef.current) {
        if (chartType === 'candles') {
          mainSeriesRef.current.setData(allData);
        } else {
          mainSeriesRef.current.setData(allData.map(candle => ({
            time: candle.time,
            value: candle.close
          })));
        }
      }
      
      if (volumeSeriesRef.current && showVolume) {
        volumeSeriesRef.current.setData(generateVolumeData(allData));
      }
      
      if (emaSeriesRef.current && showEMA) {
        emaSeriesRef.current.setData(calculateEMA(allData, 20));
      }
      
      console.log(`Loaded ${olderCandlestickData.length} more candles. Total: ${totalCandlesLoaded + olderCandlestickData.length}`);
    } catch (error) {
      console.error("Error loading more historical data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isLoadingData, oldestLoadedTime, market.symbol, candlestickData, chartType, showVolume, showEMA, totalCandlesLoaded]);
  
  // Create and configure chart
  useEffect(() => {
    console.log("Creating chart. Container:", chartContainerRef.current, "Data length:", candlestickData.length);
    
    if (!chartContainerRef.current || !candlestickData.length) {
      console.log("Cannot create chart yet - container or data missing");
      return;
    }
    
    // Make sure the chart container has dimensions
    if (chartContainerRef.current.clientWidth === 0 || chartContainerRef.current.clientHeight === 0) {
      console.log("Chart container has zero width or height");
      
      // Force a minimum size to the container
      chartContainerRef.current.style.width = '100%';
      chartContainerRef.current.style.height = '400px';
      
      // Return early and let the resize observer trigger a re-render
      return;
    }

    try {
      // Clear previous chart
      if (chartRef.current) {
        console.log("Removing previous chart");
        chartRef.current.remove();
        chartRef.current = null;
      }
      
      console.log("Creating new chart with dimensions:", chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
      
      // Configure chart options
      const chart = createChart(chartContainerRef.current, {
        layout: {
          backgroundColor: 'transparent',
          textColor: '#333',
        },
        grid: {
          vertLines: {
            color: 'rgba(79, 140, 255, 0.1)',
          },
          horzLines: {
            color: 'rgba(79, 140, 255, 0.1)',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          borderColor: 'rgba(79, 140, 255, 0.2)',
          timeVisible: true,
          rightOffset: 5,  // Add some space on the right
          barSpacing: 10,  // Controls the spacing between bars
          fixLeftEdge: false, // Allow scrolling to the past
          fixRightEdge: true, // Fixes the right edge to the most recent candle
          lockVisibleTimeRangeOnResize: true, // Prevents changing the visible time range when the chart is resized
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
      
      chartRef.current = chart;
      console.log("Chart created successfully");
      
      // Add price series based on selected chart type
      let mainSeries;
      if (chartType === 'candles') {
        mainSeries = chart.addCandlestickSeries({
          upColor: 'rgba(45, 255, 122, 1)',
          downColor: 'rgba(255, 45, 122, 1)',
          borderVisible: false,
          wickUpColor: 'rgba(45, 255, 122, 0.8)',
          wickDownColor: 'rgba(255, 45, 122, 0.8)',
        });
        mainSeries.setData(candlestickData);
      } else {
        mainSeries = chart.addLineSeries({
          color: '#4f8cff',
          lineWidth: 2,
        });
        mainSeries.setData(candlestickData.map(candle => ({
          time: candle.time,
          value: candle.close
        })));
      }
      
      mainSeriesRef.current = mainSeries;
      
      // Add volume if enabled
      if (showVolume) {
        const volumeSeries = chart.addHistogramSeries({
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
        volumeSeries.setData(volumeData);
        volumeSeriesRef.current = volumeSeries;
      }
      
      // Add EMA if enabled
      if (showEMA) {
        const emaSeries = chart.addLineSeries({
          color: '#ffd02d',
          lineWidth: 2,
          priceLineVisible: false,
        });
        emaSeries.setData(emaData);
        emaSeriesRef.current = emaSeries;
      }
      
      // Set up event listener for loading more data when scrolling left
      chart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
        if (logicalRange === null) return;
        
        // If user has scrolled close to the left edge, load more data
        const { from } = logicalRange;
        
        // Load more data if we're close to the left edge (first 5% of visible range)
        if (from < 5) {
          loadMoreData();
        }
      });
      
      // Fit content
      chart.timeScale().fitContent();
      console.log("Chart data loaded and fitted");
      
      // Set up resize observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      resizeObserverRef.current = new ResizeObserver(entries => {
        if (entries.length === 0 || !chartRef.current) return;
        const { width, height } = entries[0].contentRect;
        console.log("Chart container resized to:", width, height);
        if (width > 0 && height > 0) {
          chartRef.current.resize(width, height);
        }
      });
      
      resizeObserverRef.current.observe(chartContainerRef.current);
      console.log("Resize observer set up");
    } catch (error) {
      console.error("Error creating chart:", error);
    }
    
    // Cleanup
    return () => {
      console.log("Cleaning up chart component");
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [candlestickData, chartType, showVolume, showEMA, showRSI, emaData, volumeData, loadMoreData]);
  
  // Handle timeframe change
  const handleTimeframeChange = async (newTimeframe) => {
    setTimeframe(newTimeframe);
    setIsLoadingData(true);
    
    try {
      // Determine interval and output size based on timeframe
      const intervalMap = {
        '1H': { interval: '1hour', outputSize: 168 }, // 1 week of hourly data
        '4H': { interval: '4hour', outputSize: 180 }, // 1 month of 4-hour data
        '1D': { interval: '1day', outputSize: 90 },   // 3 months of daily data
        '1W': { interval: '1week', outputSize: 52 },  // 1 year of weekly data
        '1M': { interval: '1month', outputSize: 24 }  // 2 years of monthly data
      };
      
      const { interval, outputSize } = intervalMap[newTimeframe] || intervalMap['1D'];
      
      // Fetch real historical data for new timeframe
      const historicalData = await marketDataService.getTimeSeries(
        market.symbol, 
        interval, 
        outputSize
      );
      
      // Transform data to chart format
      const newCandlestickData = historicalData.map(item => ({
        time: Math.floor(new Date(item.x).getTime() / 1000),
        open: item.y[0],
        high: item.y[1],
        low: item.y[2],
        close: item.y[3],
        volume: item.volume || Math.floor(Math.random() * 1000000)
      }));
      
      if (newCandlestickData.length > 0) {
        setOldestLoadedTime(newCandlestickData[0].time);
      }
      
      setCandlestickData(newCandlestickData);
      setVolumeData(generateVolumeData(newCandlestickData));
      setEmaData(calculateEMA(newCandlestickData, 20));
      setTotalCandlesLoaded(newCandlestickData.length);
      
    } catch (error) {
      console.error('Error fetching data for new timeframe:', error);
      // Keep existing data on error
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // Get the latest price data
  const latestData = candlestickData.length > 0 ? candlestickData[candlestickData.length - 1] : null;
  
  return (
    <div>
      <ChartControls>
        <TimeframeButtons>
          <TimeframeButton 
            active={timeframe === '1H'} 
            onClick={() => handleTimeframeChange('1H')}
          >
            1H
          </TimeframeButton>
          <TimeframeButton 
            active={timeframe === '4H'} 
            onClick={() => handleTimeframeChange('4H')}
          >
            4H
          </TimeframeButton>
          <TimeframeButton 
            active={timeframe === '1D'} 
            onClick={() => handleTimeframeChange('1D')}
          >
            1D
          </TimeframeButton>
          <TimeframeButton 
            active={timeframe === '1W'} 
            onClick={() => handleTimeframeChange('1W')}
          >
            1W
          </TimeframeButton>
          <TimeframeButton 
            active={timeframe === '1M'} 
            onClick={() => handleTimeframeChange('1M')}
          >
            1M
          </TimeframeButton>
        </TimeframeButtons>
        
        <ChartTypeButtons>
          <TimeframeButton 
            active={chartType === 'candles'} 
            onClick={() => setChartType('candles')}
          >
            Candles
          </TimeframeButton>
          <TimeframeButton 
            active={chartType === 'line'} 
            onClick={() => setChartType('line')}
          >
            Line
          </TimeframeButton>
        </ChartTypeButtons>
        
        <IndicatorButtons>
          <TimeframeButton 
            active={showVolume} 
            onClick={() => setShowVolume(!showVolume)}
          >
            Volume
          </TimeframeButton>
          <TimeframeButton 
            active={showEMA} 
            onClick={() => setShowEMA(!showEMA)}
          >
            EMA
          </TimeframeButton>
          <TimeframeButton 
            active={showRSI} 
            onClick={() => setShowRSI(!showRSI)}
          >
            RSI
          </TimeframeButton>
        </IndicatorButtons>
      </ChartControls>
      
      {latestData && (
        <PriceInfo>
          <PriceInfoItem>
            <PriceLabel>Open</PriceLabel>
            <PriceValue>${latestData.open.toFixed(2)}</PriceValue>
          </PriceInfoItem>
          <PriceInfoItem>
            <PriceLabel>High</PriceLabel>
            <PriceValue>${latestData.high.toFixed(2)}</PriceValue>
          </PriceInfoItem>
          <PriceInfoItem>
            <PriceLabel>Low</PriceLabel>
            <PriceValue>${latestData.low.toFixed(2)}</PriceValue>
          </PriceInfoItem>
          <PriceInfoItem>
            <PriceLabel>Close</PriceLabel>
            <PriceValue>${latestData.close.toFixed(2)}</PriceValue>
          </PriceInfoItem>
          <PriceInfoItem>
            <PriceLabel>Volume</PriceLabel>
            <PriceValue>{latestData.volume}</PriceValue>
          </PriceInfoItem>
          <PriceInfoItem>
            <PriceLabel>Total Candles</PriceLabel>
            <PriceValue>{totalCandlesLoaded}</PriceValue>
          </PriceInfoItem>
        </PriceInfo>
      )}
      
      <ChartContainer ref={chartContainerRef}>
        {isLoadingData && <LoadingOverlay>Loading historical data...</LoadingOverlay>}
      </ChartContainer>
    </div>
  );
};

export default AdvancedTradingChart; 