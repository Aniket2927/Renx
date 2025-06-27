import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  TextInput,
  Text,
  Chip,
  Surface,
  useTheme,
  Portal,
  Modal,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

interface OrderData {
  symbol: string;
  quantity: number;
  price: number;
  orderType: 'market' | 'limit';
  side: 'buy' | 'sell';
}

interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

const TradingScreen: React.FC = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  
  // Order form state
  const [orderData, setOrderData] = useState<OrderData>({
    symbol: '',
    quantity: 0,
    price: 0,
    orderType: 'market',
    side: 'buy',
  });

  useEffect(() => {
    loadTradingData();
  }, []);

  const loadTradingData = async () => {
    try {
      setLoading(true);
      const [positionsResponse, ordersResponse] = await Promise.all([
        ApiService.getPortfolioPositions(),
        ApiService.getOpenOrders(),
      ]);

      if (positionsResponse.success) {
        setPositions(positionsResponse.data || []);
      }

      if (ordersResponse.success) {
        setOpenOrders(ordersResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load trading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTradingData();
    setRefreshing(false);
  };

  const handlePlaceOrder = async () => {
    try {
      if (!orderData.symbol || orderData.quantity <= 0) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (orderData.orderType === 'limit' && orderData.price <= 0) {
        Alert.alert('Error', 'Please enter a valid limit price');
        return;
      }

      setLoading(true);
      const response = await ApiService.placeOrder(orderData);

      if (response.success) {
        Alert.alert('Success', 'Order placed successfully');
        setShowOrderModal(false);
        setOrderData({
          symbol: '',
          quantity: 0,
          price: 0,
          orderType: 'market',
          side: 'buy',
        });
        await loadTradingData();
      } else {
        Alert.alert('Error', response.error || 'Failed to place order');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
      console.error('Order placement error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPosition = (position: Position) => (
    <Card key={position.symbol} style={styles.positionCard}>
      <Card.Content>
        <View style={styles.positionHeader}>
          <Text style={styles.symbolText}>{position.symbol}</Text>
          <View style={styles.pnlContainer}>
            <Text
              style={[
                styles.pnlText,
                { color: position.unrealizedPnL >= 0 ? theme.colors.secondary : theme.colors.error }
              ]}
            >
              ${position.unrealizedPnL.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.pnlPercentText,
                { color: position.unrealizedPnL >= 0 ? theme.colors.secondary : theme.colors.error }
              ]}
            >
              ({position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
        
        <View style={styles.positionDetails}>
          <Text style={styles.detailText}>Qty: {position.quantity}</Text>
          <Text style={styles.detailText}>Avg: ${position.averagePrice.toFixed(2)}</Text>
          <Text style={styles.detailText}>Current: ${position.currentPrice.toFixed(2)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderOpenOrder = (order: any) => (
    <Card key={order.id} style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <Text style={styles.symbolText}>{order.symbol}</Text>
          <Chip
            mode="outlined"
            style={[
              styles.orderTypeChip,
              { backgroundColor: order.side === 'buy' ? theme.colors.secondary : theme.colors.error }
            ]}
          >
            {order.side.toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={styles.detailText}>Qty: {order.quantity}</Text>
          <Text style={styles.detailText}>Type: {order.orderType}</Text>
          {order.price && <Text style={styles.detailText}>Price: ${order.price.toFixed(2)}</Text>}
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
        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setShowOrderModal(true)}
                style={styles.actionButton}
              >
                New Order
              </Button>
              <Button
                mode="outlined"
                icon="chart-line"
                onPress={() => {/* Navigate to market analysis */}}
                style={styles.actionButton}
              >
                Market Analysis
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Positions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Positions ({positions.length})</Title>
            {positions.length > 0 ? (
              positions.map(renderPosition)
            ) : (
              <Text style={styles.emptyText}>No open positions</Text>
            )}
          </Card.Content>
        </Card>

        {/* Open Orders */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Open Orders ({openOrders.length})</Title>
            {openOrders.length > 0 ? (
              openOrders.map(renderOpenOrder)
            ) : (
              <Text style={styles.emptyText}>No open orders</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Order Modal */}
      <Portal>
        <Modal
          visible={showOrderModal}
          onDismiss={() => setShowOrderModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title>Place Order</Title>
              
              <TextInput
                label="Symbol"
                value={orderData.symbol}
                onChangeText={(text) => setOrderData({ ...orderData, symbol: text.toUpperCase() })}
                style={styles.input}
                autoCapitalize="characters"
              />
              
              <TextInput
                label="Quantity"
                value={orderData.quantity.toString()}
                onChangeText={(text) => setOrderData({ ...orderData, quantity: parseFloat(text) || 0 })}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <View style={styles.orderTypeContainer}>
                <Text>Order Type:</Text>
                <View style={styles.chipContainer}>
                  <Chip
                    selected={orderData.orderType === 'market'}
                    onPress={() => setOrderData({ ...orderData, orderType: 'market' })}
                    style={styles.chip}
                  >
                    Market
                  </Chip>
                  <Chip
                    selected={orderData.orderType === 'limit'}
                    onPress={() => setOrderData({ ...orderData, orderType: 'limit' })}
                    style={styles.chip}
                  >
                    Limit
                  </Chip>
                </View>
              </View>
              
              {orderData.orderType === 'limit' && (
                <TextInput
                  label="Limit Price"
                  value={orderData.price.toString()}
                  onChangeText={(text) => setOrderData({ ...orderData, price: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
              
              <View style={styles.sideContainer}>
                <Button
                  mode={orderData.side === 'buy' ? 'contained' : 'outlined'}
                  onPress={() => setOrderData({ ...orderData, side: 'buy' })}
                  style={[styles.sideButton, { backgroundColor: orderData.side === 'buy' ? theme.colors.secondary : 'transparent' }]}
                >
                  Buy
                </Button>
                <Button
                  mode={orderData.side === 'sell' ? 'contained' : 'outlined'}
                  onPress={() => setOrderData({ ...orderData, side: 'sell' })}
                  style={[styles.sideButton, { backgroundColor: orderData.side === 'sell' ? theme.colors.error : 'transparent' }]}
                >
                  Sell
                </Button>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowOrderModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handlePlaceOrder}
                  loading={loading}
                  style={styles.modalButton}
                >
                  Place Order
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  actionsCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  positionCard: {
    marginVertical: 4,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pnlContainer: {
    alignItems: 'flex-end',
  },
  pnlText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pnlPercentText: {
    fontSize: 12,
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  orderCard: {
    marginVertical: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTypeChip: {
    height: 24,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
  modalContainer: {
    margin: 20,
  },
  input: {
    marginVertical: 8,
  },
  orderTypeContainer: {
    marginVertical: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
  sideContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  sideButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default TradingScreen; 