import React, { useEffect, useState, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import SimpleChart from './SimpleChart';

const ChartContainer = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  margin-bottom: 20px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  color: #4f8cff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 10px;
`;

const TimeframeButton = styled.button`
  background: ${props => props.active ? '#4f8cff' : 'rgba(79, 140, 255, 0.1)'};
  color: ${props => props.active ? '#fff' : '#4f8cff'};
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#4f8cff' : 'rgba(79, 140, 255, 0.2)'};
  }
`;

const ChartInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const PriceInfo = styled.div`
  display: flex;
  gap: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

const PriceTrend = styled.span`
  color: ${props => props.trend === 'up' ? '#2dff7a' : '#ff2d7a'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AIPredictionSection = styled.div`
  background: rgba(79, 140, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-top: 15px;
`;

const PredictionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const PredictionTitle = styled.h4`
  font-size: 0.875rem;
  color: #4f8cff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PredictionConfidence = styled.div`
  font-size: 0.75rem;
  color: ${props => {
    if (props.confidence >= 80) return '#2dff7a';
    if (props.confidence >= 50) return '#ffd02d';
    return '#ff2d7a';
  }};
  font-weight: 500;
`;

const PredictionContent = styled.div`
  display: flex;
  gap: 15px;
`;

const PredictionValue = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PredictionIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: ${props => props.trend === 'up' ? '#2dff7a' : '#ff2d7a'};
  font-weight: 500;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  z-index: 10;
`;

// Main component
const AITradingChart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1d');
  const [priceData, setPriceData] = useState({
    current: 0,
    change: 0,
    high: 0,
    low: 0,
    volume: '0'
  });
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartError, setChartError] = useState(false);
  const [symbol] = useState('BTC'); // Default to Bitcoin

  // Fetch real data from API
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const fetchRealData = async () => {
      setLoading(true);
      setChartError(false);
      
      try {
        // Fetch real historical data
        const historicalData = await marketDataService.getTimeSeries(
          symbol, 
          timeframe === '1d' ? '1hour' : 
          timeframe === '1w' ? '1day' : 
          timeframe === '1m' ? '1day' : '1day',
          timeframe === '1d' ? 24 : 
          timeframe === '1w' ? 7 : 
          timeframe === '1m' ? 30 : 90
        );

        // Fetch current quote
        const quote = await marketDataService.getQuote(symbol);

        // Format data for chart
        const chartData = historicalData.map(item => ({
          time: Math.floor(new Date(item.x).getTime() / 1000),
          open: item.y[0],
          high: item.y[1],
          low: item.y[2],
          close: item.y[3],
          volume: item.volume || Math.floor(Math.random() * 1000000)
        }));

        // Create or update chart
        if (!chartRef.current) {
          const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: {
              background: { type: 'solid', color: 'transparent' },
              textColor: '#333',
            },
            grid: {
              vertLines: { color: 'rgba(79, 140, 255, 0.1)' },
              horzLines: { color: 'rgba(79, 140, 255, 0.1)' },
            },
            timeScale: {
              borderColor: 'rgba(79, 140, 255, 0.2)',
              timeVisible: true,
            },
          });
          
          const candleSeries = chart.addCandlestickSeries({
            upColor: '#2dff7a',
            downColor: '#ff2d7a',
            borderVisible: false,
            wickUpColor: '#2dff7a',
            wickDownColor: '#ff2d7a',
          });
          
          candleSeries.setData(chartData);
          
          // Add volume series
          const volumeSeries = chart.addHistogramSeries({
            color: 'rgba(79, 140, 255, 0.5)',
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });
          
          const volumeData = chartData.map(item => ({
            time: item.time,
            value: item.volume,
            color: item.close > item.open ? 'rgba(45, 255, 122, 0.5)' : 'rgba(255, 45, 122, 0.5)',
          }));
          
          volumeSeries.setData(volumeData);
          
          chartRef.current = {
            chart,
            candleSeries,
            volumeSeries
          };
          
          // Handle window resize
          const handleResize = () => {
            chart.applyOptions({ 
              width: chartContainerRef.current.clientWidth 
            });
          };
          
          window.addEventListener('resize', handleResize);
          
          return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
          };
        } else {
          // Update existing chart with new data
          chartRef.current.candleSeries.setData(chartData);
          
          const volumeData = chartData.map(item => ({
            time: item.time,
            value: item.volume,
            color: item.close > item.open ? 'rgba(45, 255, 122, 0.5)' : 'rgba(255, 45, 122, 0.5)',
          }));
          
          chartRef.current.volumeSeries.setData(volumeData);
        }
        
        // Update price data with real data
        setPriceData({
          current: quote.price.toFixed(2),
          change: quote.percent_change.toFixed(2),
          high: quote.high.toFixed(2),
          low: quote.low.toFixed(2),
          volume: quote.volume ? `${(quote.volume / 1000000).toFixed(2)}M` : 'N/A'
        });
        
        // Get AI prediction using real data
        try {
          const prediction = await aiService.getPrediction(symbol, chartData.map(d => d.close));
          setAiPrediction(prediction);
        } catch (predictionError) {
          console.error('Failed to get AI prediction:', predictionError);
        }
        
      } catch (error) {
        console.error("Error fetching real data:", error);
        setChartError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [timeframe, symbol]);

  // Render AI Trading Chart component
  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartHeader>
        <ChartTitle>
          <span role="img" aria-label="AI">🧠</span> 
          AI-Powered Bitcoin Analysis
        </ChartTitle>
        <ChartControls>
          <TimeframeButton 
            active={timeframe === '1d'} 
            onClick={() => setTimeframe('1d')}
          >
            1D
          </TimeframeButton>
          <TimeframeButton 
            active={timeframe === '1w'} 
            onClick={() => setTimeframe('1w')}
          >
            1W
          </TimeframeButton>
          <TimeframeButton 
            active={timeframe === '1m'} 
            onClick={() => setTimeframe('1m')}
          >
            1M
          </TimeframeButton>
          <TimeframeButton 
            active={timeframe === '3m'} 
            onClick={() => setTimeframe('3m')}
          >
            3M
          </TimeframeButton>
        </ChartControls>
      </ChartHeader>
      
      <ChartInfo>
        <PriceInfo>
          <InfoItem>
            <InfoLabel>Current Price</InfoLabel>
            <InfoValue>
              ${priceData.current}
              <PriceTrend trend={priceData.change >= 0 ? 'up' : 'down'}>
                {priceData.change >= 0 ? '▲' : '▼'} {Math.abs(priceData.change)}%
              </PriceTrend>
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>24h High</InfoLabel>
            <InfoValue>${priceData.high}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>24h Low</InfoLabel>
            <InfoValue>${priceData.low}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Volume</InfoLabel>
            <InfoValue>${priceData.volume}</InfoValue>
          </InfoItem>
        </PriceInfo>
      </ChartInfo>
      
      <div style={{ position: 'relative' }}>
        {loading && (
          <LoadingOverlay>
            <div>Loading AI analysis...</div>
          </LoadingOverlay>
        )}
        {chartError ? <SimpleChart /> : <div ref={chartContainerRef} style={{ height: '300px' }} />}
      </div>
      
      {aiPrediction && (
        <AIPredictionSection>
          <PredictionHeader>
            <PredictionTitle>
              <span role="img" aria-label="AI">🤖</span> 
              AI Price Prediction ({aiPrediction.timeframe})
            </PredictionTitle>
            <PredictionConfidence confidence={aiPrediction.confidence}>
              Confidence: {aiPrediction.confidence}%
            </PredictionConfidence>
          </PredictionHeader>
          <PredictionContent>
            <PredictionValue>
              <InfoLabel>Predicted Movement</InfoLabel>
              <PredictionIndicator trend={aiPrediction.direction}>
                {aiPrediction.direction === 'up' ? '▲' : '▼'} {aiPrediction.change}
              </PredictionIndicator>
            </PredictionValue>
            <PredictionValue>
              <InfoLabel>Target Price</InfoLabel>
              <InfoValue>${aiPrediction.predictedPrice}</InfoValue>
            </PredictionValue>
            <PredictionValue>
              <InfoLabel>AI Sentiment</InfoLabel>
              <InfoValue>{aiPrediction.direction === 'up' ? '🟢 Bullish' : '🔴 Bearish'}</InfoValue>
            </PredictionValue>
          </PredictionContent>
        </AIPredictionSection>
      )}
    </ChartContainer>
  );
};

export default AITradingChart; 