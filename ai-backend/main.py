from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from ml_service import MLService
import uvicorn
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RenX AI Backend",
    description="AI-powered trading signals and market analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML service
ml_service = MLService()

# Pydantic models
class PredictionRequest(BaseModel):
    symbol: str
    historical_data: List[Dict[str, Any]]

class SentimentRequest(BaseModel):
    text: str

class SignalRequest(BaseModel):
    symbol: str
    features: List[float]

class TrainingRequest(BaseModel):
    symbol: str

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Backend"}

# Price prediction endpoint
@app.post("/predict")
async def predict_price(request: PredictionRequest):
    try:
        logger.info(f"Received prediction request for {request.symbol}")
        result = ml_service.predict_price(request.symbol, request.historical_data)
        return result
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment analysis endpoint
@app.post("/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    try:
        result = ml_service.analyze_sentiment(request.text)
        return result
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Trading signal endpoint
@app.post("/signal")
async def get_trading_signal(request: SignalRequest):
    try:
        result = ml_service.get_trading_signal(request.symbol, request.features)
        return result
    except Exception as e:
        logger.error(f"Error in signal generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Model training endpoint
@app.post("/train")
async def train_models(request: TrainingRequest):
    try:
        result = ml_service.train_models(request.symbol)
        return result
    except Exception as e:
        logger.error(f"Error in model training: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate signals endpoint
@app.post("/generate-signals")
async def generate_signals(request: SignalRequest):
    try:
        result = ml_service.generate_signals(request.symbol, request.features)
        return result
    except Exception as e:
        logger.error(f"Error in signal generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Correlation analysis endpoint
@app.post("/correlation")
async def analyze_correlation(symbols: List[str]):
    try:
        result = ml_service.analyze_correlation(symbols)
        return result
    except Exception as e:
        logger.error(f"Error in correlation analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Anomaly detection endpoint
@app.get("/anomalies/{symbol}")
async def detect_anomalies(symbol: str):
    try:
        result = ml_service.detect_anomalies(symbol)
        return result
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8181))
    uvicorn.run(app, host="0.0.0.0", port=port) 