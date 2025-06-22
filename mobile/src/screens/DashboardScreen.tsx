import React, { useState } from 'react';
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
  Button,
  Chip,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioData] = useState<PortfolioData>({
    totalValue: 125430.50,
    dailyChange: 2840.25,
    dailyChangePercent: 2.31,
  });

  const [marketData] = useState<MarketData[]>([
    { symbol: 'AAPL', price: 175.23, change: 2.45, changePercent: 1.42 },
    { symbol: 'GOOGL', price: 140.85, change: -1.23, changePercent: -0.87 },
    { symbol: 'MSFT', price: 380.12, change: 5.67, changePercent: 1.51 },
    { symbol: 'TSLA', price: 201.45, change: -3.21, changePercent: -1.57 },
  ]);

  // Sample chart data
  const chartData = {
    labels: ['1W', '2W', '3W', '4W', '1M'],
    datasets: [
      {
        data: [120000, 122000, 121500, 124000, 125430],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      },
    ],
  };

  const pieData = [
    {
      name: 'Stocks',
      population: 65,
      color: '#3B82F6',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
    {
      name: 'Crypto',
      population: 20,
      color: '#10B981',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
    {
      name: 'Cash',
      population: 15,
      color: '#F59E0B',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
  ];

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Portfolio Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.portfolioHeader}>
            <View>
              <Title style={styles.portfolioValue}>
                {formatCurrency(portfolioData.totalValue)}
              </Title>
              <View style={styles.changeContainer}>
                <MaterialCommunityIcons
                  name={portfolioData.dailyChange >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={portfolioData.dailyChange >= 0 ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.changeText,
                    {
                      color: portfolioData.dailyChange >= 0 ? '#10B981' : '#EF4444',
                    },
                  ]}
                >
                  {formatCurrency(Math.abs(portfolioData.dailyChange))} (
                  {formatPercent(portfolioData.dailyChangePercent)})
                </Text>
              </View>
            </View>
            <Chip mode="outlined" icon="chart-line">
              Today
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Portfolio Performance Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Portfolio Performance</Title>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Asset Allocation */}
      <Card style={styles.card}>
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

      {/* Watchlist */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title>Watchlist</Title>
            <Button mode="text" compact>
              View All
            </Button>
          </View>
          {marketData.map((stock, index) => (
            <Surface key={stock.symbol} style={styles.stockItem}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockPrice}>{formatCurrency(stock.price)}</Text>
              </View>
              <View style={styles.stockChange}>
                <MaterialCommunityIcons
                  name={stock.change >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={stock.change >= 0 ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.changeText,
                    {
                      color: stock.change >= 0 ? '#10B981' : '#EF4444',
                    },
                  ]}
                >
                  {formatPercent(stock.changePercent)}
                </Text>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={[styles.card, styles.lastCard]}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="chart-line"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Trade
            </Button>
            <Button
              mode="outlined"
              icon="robot"
              style={styles.actionButton}
              onPress={() => {}}
            >
              AI Signals
            </Button>
            <Button
              mode="outlined"
              icon="chart-box"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Analytics
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  lastCard: {
    marginBottom: 32,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockPrice: {
    fontSize: 14,
    opacity: 0.7,
  },
  stockChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default DashboardScreen;
