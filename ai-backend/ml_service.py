import os
# Disable oneDNN custom operations before importing TensorFlow
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from transformers import pipeline
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
        self.sentiment_analyzer = pipeline("sentiment-analysis", model="finiteautomata/bertweet-base-sentiment-analysis")
        
        # Initialize price prediction model
        self.price_model = self._build_price_model()
        self.price_scaler = MinMaxScaler()
        
        # Initialize trading signal model
        self.signal_model = self._build_signal_model()
        self.signal_scaler = MinMaxScaler()
        
        # Initialize SentimentIntensityAnalyzer
        self.sia = SentimentIntensityAnalyzer()
        
        # Download required NLTK data
        try:
            nltk.data.find('vader_lexicon')
        except LookupError:
            nltk.download('vader_lexicon')

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
            
            # Make prediction
            prediction = self.price_model.predict(X, verbose=0)
            
            # Calculate confidence based on model's loss
            confidence = 1.0 / (1.0 + self.price_model.evaluate(X, prediction, verbose=0))
            
            return {
                "predicted_price": float(prediction[-1][0]),
                "confidence": float(confidence),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in predict_price: {str(e)}")
            raise

    def analyze_sentiment(self, text):
        try:
            # Get sentiment prediction
            result = self.sentiment_analyzer(text)[0]
            
            # Map sentiment to our format
            sentiment_map = {
                'POS': 'positive',
                'NEG': 'negative',
                'NEU': 'neutral'
            }
            
            return {
                'sentiment': sentiment_map.get(result['label'], 'neutral'),
                'confidence': float(result['score']),
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
            # Convert features to numpy array and scale
            feature_array = np.array(features).reshape(1, -1)
            scaled_features = self.signal_scaler.fit_transform(feature_array)
            
            # Train model if needed
            self.train_models(symbol)
            
            # Make prediction
            prediction = self.signal_model.predict(scaled_features, verbose=0)[0]
            
            # Get signal and confidence
            signal_map = {0: 'BUY', 1: 'SELL', 2: 'HOLD'}
            signal_idx = np.argmax(prediction)
            signal = signal_map[signal_idx]
            confidence = float(prediction[signal_idx])
            
            return {
                'signal': signal,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in trading signal: {str(e)}")
            raise

    def train_models(self, symbol):
        try:
            logger.info(f"Starting model training for {symbol}")
            
            # Fetch historical data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            data = yf.download(symbol, start=start_date, end=end_date)
            
            if data.empty:
                raise ValueError(f"No data downloaded for {symbol}")
            
            # Convert column names to lowercase
            data.columns = [c.lower() for c in data.columns]
            
            logger.info(f"Downloaded {len(data)} days of data")
            logger.info(f"Data columns: {data.columns.tolist()}")
            
            # Prepare price prediction data
            X_price = self._prepare_price_data(data.to_dict('records'))
            y_price = data['close'].values[60:]
            
            # Train price prediction model
            logger.info("Training price prediction model...")
            self.price_model.fit(
                X_price, y_price,
                epochs=50,
                batch_size=32,
                validation_split=0.1,
                verbose=0
            )
            
            # Prepare trading signal data
            indicators = self._calculate_technical_indicators(data)
            X_signal = indicators.dropna().values
            y_signal = np.where(
                data['close'].shift(-1) > data['close'],
                0,  # BUY
                np.where(
                    data['close'].shift(-1) < data['close'],
                    1,  # SELL
                    2   # HOLD
                )
            )[60:]
            
            # Train trading signal model
            logger.info("Training trading signal model...")
            self.signal_model.fit(
                X_signal, y_signal,
                epochs=50,
                batch_size=32,
                validation_split=0.1,
                verbose=0
            )
            
            logger.info("Model training completed successfully")
            return True
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            raise

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

    def _calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        deltas = np.diff(prices)
        gain = np.where(deltas > 0, deltas, 0)
        loss = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gain[:period])
        avg_loss = np.mean(loss[:period])
        
        for i in range(period, len(deltas)):
            avg_gain = (avg_gain * (period - 1) + gain[i]) / period
            avg_loss = (avg_loss * (period - 1) + loss[i]) / period
        
        rs = avg_gain / avg_loss if avg_loss != 0 else 0
        rsi = 100 - (100 / (1 + rs))
        
        return rsi

    def _calculate_macd(self, prices: List[float]) -> Dict[str, float]:
        """Calculate MACD (Moving Average Convergence Divergence)"""
        exp1 = pd.Series(prices).ewm(span=12, adjust=False).mean()
        exp2 = pd.Series(prices).ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        
        return {
            'macd': macd.iloc[-1],
            'signal': signal.iloc[-1],
            'histogram': macd.iloc[-1] - signal.iloc[-1]
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
        """Generate trading signals based on technical indicators"""
        try:
            # Calculate technical indicators
            rsi = self._calculate_rsi(features)
            macd = self._calculate_macd(features)
            
            # Generate signal
            signal = self._generate_signal(rsi, macd)
            
            return {
                "signal": signal,
                "rsi": rsi,
                "macd": macd,
                "confidence": self._calculate_signal_confidence(rsi, macd),
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