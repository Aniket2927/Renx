import os
# Disable oneDNN custom operations before importing TensorFlow
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import numpy as np
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import logging
import warnings
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import requests
from typing import List, Dict, Any, Optional

# Suppress warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=UserWarning)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLService:
    def __init__(self):
        # Initialize sentiment analyzer
        self.sia = SentimentIntensityAnalyzer()
        
        # Initialize scalers
        self.price_scaler = MinMaxScaler()
        self.signal_scaler = MinMaxScaler()
        
        # Download required NLTK data
        try:
            nltk.data.find('vader_lexicon')
        except LookupError:
            nltk.download('vader_lexicon')

    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        # Get sentiment scores using VADER
        sentiment_scores = self.sia.polarity_scores(text)
        
        # Get sentiment using TextBlob as a second opinion
        blob = TextBlob(text)
        textblob_sentiment = blob.sentiment.polarity
        
        # Combine both scores
        sentiment_scores['textblob_score'] = textblob_sentiment
        return sentiment_scores
        
    def get_trading_signals(self, symbol: str) -> Dict[str, Any]:
        try:
            # Get historical data
            stock = yf.Ticker(symbol)
            hist = stock.history(period="1mo")
            
            if len(hist) < 2:
                return {"error": "Not enough historical data"}
                
            # Calculate basic technical indicators
            hist['SMA_5'] = hist['Close'].rolling(window=5).mean()
            hist['SMA_20'] = hist['Close'].rolling(window=20).mean()
            
            # Generate trading signals
            current_price = hist['Close'].iloc[-1]
            sma_5 = hist['SMA_5'].iloc[-1]
            sma_20 = hist['SMA_20'].iloc[-1]
            
            # Simple trend analysis
            trend = "bullish" if sma_5 > sma_20 else "bearish"
            
            # Calculate price change
            price_change = (current_price - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2] * 100
            
            return {
                "symbol": symbol,
                "current_price": current_price,
                "trend": trend,
                "price_change_percent": price_change,
                "sma_5": sma_5,
                "sma_20": sma_20,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating trading signals for {symbol}: {str(e)}")
            return {"error": str(e)}
            
    def predict_price_movement(self, symbol: str) -> Dict[str, Any]:
        try:
            # Get historical data
            stock = yf.Ticker(symbol)
            hist = stock.history(period="3mo")
            
            if len(hist) < 30:
                return {"error": "Not enough historical data"}
                
            # Calculate momentum indicators
            hist['ROC'] = hist['Close'].pct_change(periods=20)
            hist['RSI'] = self._calculate_rsi(hist['Close'])
            
            # Get latest values
            latest_roc = hist['ROC'].iloc[-1]
            latest_rsi = hist['RSI'].iloc[-1]
            
            # Simple prediction logic based on RSI and ROC
            prediction = "up" if (latest_rsi < 30 and latest_roc > 0) else "down" if (latest_rsi > 70 and latest_roc < 0) else "neutral"
            
            confidence = min(abs(latest_roc) * 100, 100)  # Simple confidence score
            
            return {
                "symbol": symbol,
                "prediction": prediction,
                "confidence": confidence,
                "indicators": {
                    "rsi": latest_rsi,
                    "roc": latest_roc
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting price movement for {symbol}: {str(e)}")
            return {"error": str(e)}
            
    def _calculate_rsi(self, prices: pd.Series, periods: int = 14) -> pd.Series:
        # Calculate RSI
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=periods).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=periods).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def _build_price_model(self):
        # Using Functional API with Input layer
        inputs = Input(shape=(60, 5))
        x = LSTM(50, return_sequences=True)(inputs)
        x = Dropout(0.2)(x)
        x = LSTM(50, return_sequences=False)(x)
        x = Dropout(0.2)(x)
        x = Dense(25)(x)
        outputs = Dense(1)(x)
        
        model = Model(inputs=inputs, outputs=outputs)
        model.compile(optimizer='adam', loss='mse')
        return model

    def _build_signal_model(self):
        # Using Functional API with Input layer
        inputs = Input(shape=(5,))
        x = Dense(64, activation='relu')(inputs)
        x = Dropout(0.2)(x)
        x = Dense(32, activation='relu')(x)
        x = Dropout(0.2)(x)
        outputs = Dense(3, activation='softmax')(x)
        
        model = Model(inputs=inputs, outputs=outputs)
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        return model

    def _prepare_price_data(self, historical_data):
        try:
            # Check if we have enough data
            if len(historical_data) < 60:
                raise ValueError(f"Not enough historical data. Need at least 60 days, got {len(historical_data)}")

            # Debug: log the first few items
            logger.info(f"First 3 items of historical_data: {historical_data[:3]}")

            # Convert historical data to numpy array, handling both dict and tuple formats
            data = []
            for d in historical_data:
                if isinstance(d, dict):
                    # Handle dictionary format
                    data.append([
                        float(d['open']),
                        float(d['high']),
                        float(d['low']),
                        float(d['close']),
                        float(d['volume'])
                    ])
                elif isinstance(d, tuple):
                    # Handle tuple format (Open, High, Low, Close, Volume)
                    data.append([
                        float(d[0]),  # Open
                        float(d[1]),  # High
                        float(d[2]),  # Low
                        float(d[3]),  # Close
                        float(d[4])   # Volume
                    ])
                else:
                    logger.warning(f"Skipping unsupported data format: {d}")
            
            data = np.array(data)
            logger.info(f"Prepared data shape: {data.shape}")
            
            # Scale the data
            scaled_data = self.price_scaler.fit_transform(data)
            
            # Create sequences for LSTM
            X = []
            for i in range(60, len(scaled_data)):
                X.append(scaled_data[i-60:i])
            
            X = np.array(X)
            logger.info(f"Final X shape: {X.shape}")
            return X
        except Exception as e:
            logger.error(f"Error in _prepare_price_data: {str(e)}")
            raise

    def predict_price(self, symbol, historical_data):
        try:
            logger.info(f"Predicting price for {symbol}")
            
            # Simple moving average prediction
            if len(historical_data) < 2:
                return {
                    "predicted_price": 0,
                    "confidence": 0,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Use last price as prediction
            last_price = float(historical_data[-1]['close'])
            
            return {
                "predicted_price": last_price,
                "confidence": 0.5,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in predict_price: {str(e)}")
            raise

    def analyze_sentiment(self, text):
        try:
            # Get VADER sentiment scores
            scores = self.sia.polarity_scores(text)
            
            # Determine sentiment
            if scores['compound'] >= 0.05:
                sentiment = 'positive'
            elif scores['compound'] <= -0.05:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                'sentiment': sentiment,
                'confidence': abs(scores['compound']),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            raise

    def _calculate_technical_indicators(self, data):
        try:
            # Calculate technical indicators
            df = pd.DataFrame()
            
            # Simple Moving Averages
            df['sma_20'] = data['close'].rolling(window=20).mean()
            df['sma_50'] = data['close'].rolling(window=50).mean()
            
            # Relative Strength Index (RSI)
            delta = data['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['rsi'] = 100 - (100 / (1 + rs))
            
            # MACD
            exp1 = data['close'].ewm(span=12, adjust=False).mean()
            exp2 = data['close'].ewm(span=26, adjust=False).mean()
            df['macd'] = exp1 - exp2
            df['signal'] = df['macd'].ewm(span=9, adjust=False).mean()
            
            # Bollinger Bands
            df['bb_middle'] = data['close'].rolling(window=20).mean()
            df['bb_std'] = data['close'].rolling(window=20).std()
            df['bb_upper'] = df['bb_middle'] + (df['bb_std'] * 2)
            df['bb_lower'] = df['bb_middle'] - (df['bb_std'] * 2)
            
            # Volume indicators
            df['volume_sma'] = data['volume'].rolling(window=20).mean()
            df['volume_ratio'] = data['volume'] / df['volume_sma']
            
            # Price momentum
            df['momentum'] = data['close'].pct_change(periods=10)
            
            # Volatility
            df['volatility'] = data['close'].rolling(window=20).std()
            
            # Fill NaN values with 0
            df = df.fillna(0)
            
            return df
        except Exception as e:
            logger.error(f"Error calculating technical indicators: {str(e)}")
            raise

    def get_trading_signal(self, symbol, features):
        try:
            # Simple rule-based signal
            if len(features) < 2:
                return {
                    'signal': 'HOLD',
                    'confidence': 0.5,
                    'timestamp': datetime.now().isoformat()
                }
            
            current = features[-1]
            previous = features[-2]
            
            if current > previous * 1.02:  # 2% increase
                signal = 'BUY'
                confidence = 0.6
            elif current < previous * 0.98:  # 2% decrease
                signal = 'SELL'
                confidence = 0.6
            else:
                signal = 'HOLD'
                confidence = 0.5
            
            return {
                'signal': signal,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in trading signal: {str(e)}")
            raise

    def train_models(self, symbol):
        # No training needed for rule-based approach
            return True

    def _fetch_news(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch news articles for a symbol"""
        # Implement news fetching logic here
        # This is a placeholder implementation
        return []

    def _fetch_historical_data(self, symbol: str) -> Dict[str, Any]:
        """Fetch historical data for a symbol"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        data = yf.download(symbol, start=start_date, end=end_date)
        return {
            'close': data['Close'].values,
            'volume': data['Volume'].values,
            'returns': data['Close'].pct_change().values
        }

    def _calculate_zscore(self, data: List[float]) -> List[float]:
        """Calculate z-scores for anomaly detection"""
        mean = np.mean(data)
        std = np.std(data)
        return [(x - mean) / std for x in data]

    def _find_anomalies(self, price_zscore: List[float], volume_zscore: List[float]) -> List[Dict[str, Any]]:
        """Find anomalies in price and volume data"""
        anomalies = []
        threshold = 2.0  # Standard deviations
        
        for i in range(len(price_zscore)):
            if abs(price_zscore[i]) > threshold or abs(volume_zscore[i]) > threshold:
                anomalies.append({
                    'timestamp': (datetime.now() - timedelta(days=len(price_zscore)-i)).isoformat(),
                    'price_zscore': price_zscore[i],
                    'volume_zscore': volume_zscore[i],
                    'severity': 'high' if abs(price_zscore[i]) > 3.0 or abs(volume_zscore[i]) > 3.0 else 'medium'
                })
        
        return anomalies

    def _calculate_confidence(self, predictions: np.ndarray) -> float:
        """Calculate confidence score for predictions"""
        # Implement confidence calculation logic
        return 0.85  # Placeholder

    def _calculate_signal_confidence(self, rsi: float, macd: Dict[str, float]) -> float:
        """Calculate confidence score for trading signals"""
        # Implement signal confidence calculation logic
        return 0.75  # Placeholder

    def _get_sentiment_label(self, score: float) -> str:
        """Convert sentiment score to label"""
        if score > 0.2:
            return "Positive"
        elif score < -0.2:
            return "Negative"
        else:
            return "Neutral"

    def _generate_signal(self, rsi: float, macd: Dict[str, float]) -> str:
        """Generate trading signal based on technical indicators"""
        if rsi > 70 and macd['histogram'] < 0:
            return "SELL"
        elif rsi < 30 and macd['histogram'] > 0:
            return "BUY"
        else:
            return "HOLD"

    def generate_signals(self, symbol: str, features: List[float]) -> Dict[str, Any]:
        try:
            if len(features) < 2:
                return {
                    "signal": "HOLD",
                    "confidence": 0.5,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Simple momentum-based signals
            current = features[-1]
            previous = features[-2]
            
            if current > previous * 1.02:
                signal = "BUY"
                confidence = 0.6
            elif current < previous * 0.98:
                signal = "SELL"
                confidence = 0.6
            else:
                signal = "HOLD"
                confidence = 0.5
            
            return {
                "signal": signal,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in signal generation: {str(e)}")
            raise

    def analyze_correlation(self, symbols: List[str]) -> Dict[str, Any]:
        """Analyze correlation between multiple symbols"""
        try:
            # Fetch historical data
            data = {}
            for symbol in symbols:
                data[symbol] = self._fetch_historical_data(symbol)
            
            # Calculate correlation matrix
            returns = pd.DataFrame({symbol: data[symbol]['returns'] for symbol in symbols})
            correlation_matrix = returns.corr()
            
            return {
                "correlation_matrix": correlation_matrix.to_dict(),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in correlation analysis: {str(e)}")
            raise

    def detect_anomalies(self, symbol: str) -> Dict[str, Any]:
        """Detect anomalies in price and volume data"""
        try:
            # Fetch historical data
            data = self._fetch_historical_data(symbol)
            
            # Calculate z-scores
            price_zscore = self._calculate_zscore(data['close'])
            volume_zscore = self._calculate_zscore(data['volume'])
            
            # Detect anomalies
            anomalies = self._find_anomalies(price_zscore, volume_zscore)
            
            return {
                "anomalies": anomalies,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in anomaly detection: {str(e)}")
            raise 