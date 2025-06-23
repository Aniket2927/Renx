#!/bin/bash

echo "🧠 Starting RenX AI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Download NLTK data if needed
echo "📚 Setting up NLTK data..."
python download_nltk_data.py

# Set environment variables
echo "⚙️  Setting up environment..."
python set_env.py

# Start the FastAPI server
echo "🚀 Starting AI Backend server on port 8181..."
python main.py 