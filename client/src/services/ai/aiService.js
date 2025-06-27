const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8181';

class AIService {
  async getPrediction(symbol, history) {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symbol, 
          historical_data: history 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
  }

  async getSentiment(symbol) {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      throw error;
    }
  }

  async getSignal(symbol, features) {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/signals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, features }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching signal:', error);
      throw error;
    }
  }

  async getCorrelation(symbols) {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/correlation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching correlation:', error);
      throw error;
    }
  }

  async getAnomalies(symbol) {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/anomalies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      throw error;
    }
  }
}

export default new AIService(); 