import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Surface,
  useTheme,
  Chip,
  Button,
} from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

const { width: screenWidth } = Dimensions.get('window');

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocation: number;
}

interface PerformanceData {
  labels: string[];
  datasets: {
    data: number[];
    strokeWidth?: number;
    color?: (opacity: number) => string;
  }[];
}

const PortfolioScreen: React.FC = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  useEffect(() => {
    loadPortfolioData();
  }, [selectedPeriod]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, positionsResponse, performanceResponse] = await Promise.all([
        ApiService.getPortfolioSummary(),
        ApiService.getPortfolioPositions(),
        ApiService.getPortfolioPerformance(selectedPeriod),
      ]);

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }

      if (positionsResponse.success) {
        setPositions(positionsResponse.data || []);
      }

      if (performanceResponse.success) {
        setPerformanceData(performanceResponse.data);
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolioData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const pieData = positions.slice(0, 5).map((position, index) => ({
    name: position.symbol,
    population: position.allocation,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index],
    legendFontColor: theme.colors.onSurface,
    legendFontSize: 12,
  }));

  const renderPosition = (position: Position) => (
    <Card key={position.symbol} style={styles.positionCard}>
      <Card.Content>
        <View style={styles.positionHeader}>
          <View>
            <Text style={styles.symbolText}>{position.symbol}</Text>
            <Text style={styles.quantityText}>{position.quantity} shares</Text>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.marketValueText}>
              ${position.marketValue.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.pnlText,
                { color: position.unrealizedPnL >= 0 ? theme.colors.secondary : theme.colors.error }
              ]}
            >
              {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)} 
              ({position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
        
        <View style={styles.positionDetails}>
          <Text style={styles.detailText}>
            Avg: ${position.averagePrice.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            Current: ${position.currentPrice.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            Allocation: {position.allocation.toFixed(1)}%
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Portfolio Summary */}
        {summary && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Portfolio Summary</Title>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Value</Text>
                  <Text style={styles.summaryValue}>
                    ${summary.totalValue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total P&L</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: summary.unrealizedPnL >= 0 ? theme.colors.secondary : theme.colors.error }
                    ]}
                  >
                    {summary.unrealizedPnL >= 0 ? '+' : ''}${summary.unrealizedPnL.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Day Change</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: summary.dayChange >= 0 ? theme.colors.secondary : theme.colors.error }
                    ]}
                  >
                    {summary.dayChange >= 0 ? '+' : ''}${summary.dayChange.toFixed(2)} 
                    ({summary.dayChangePercent >= 0 ? '+' : ''}{summary.dayChangePercent.toFixed(2)}%)
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Return</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: summary.unrealizedPnLPercent >= 0 ? theme.colors.secondary : theme.colors.error }
                    ]}
                  >
                    {summary.unrealizedPnLPercent >= 0 ? '+' : ''}{summary.unrealizedPnLPercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Performance Chart */}
        {performanceData && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title>Performance</Title>
              
              {/* Period Selector */}
              <View style={styles.periodSelector}>
                {['1W', '1M', '3M', '6M', '1Y'].map((period) => (
                  <Chip
                    key={period}
                    selected={selectedPeriod === period}
                    onPress={() => setSelectedPeriod(period)}
                    style={styles.periodChip}
                  >
                    {period}
                  </Chip>
                ))}
              </View>
              
              <LineChart
                data={performanceData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        {/* Asset Allocation */}
        {positions.length > 0 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title>Asset Allocation</Title>
              <PieChart
                data={pieData}
                width={screenWidth - 64}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card.Content>
          </Card>
        )}

        {/* Holdings */}
        <Card style={styles.holdingsCard}>
          <Card.Content>
            <View style={styles.holdingsHeader}>
              <Title>Holdings ({positions.length})</Title>
              <Button
                mode="outlined"
                compact
                onPress={() => {/* Navigate to rebalance */}}
              >
                Rebalance
              </Button>
            </View>
            
            {positions.length > 0 ? (
              positions.map(renderPosition)
            ) : (
              <Text style={styles.emptyText}>No positions</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  chartCard: {
    margin: 16,
    marginVertical: 8,
  },
  holdingsCard: {
    margin: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  periodChip: {
    marginHorizontal: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  holdingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  positionCard: {
    marginVertical: 4,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  marketValueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pnlText: {
    fontSize: 12,
    fontWeight: '500',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
});

export default PortfolioScreen;
