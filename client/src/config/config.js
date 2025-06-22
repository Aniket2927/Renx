const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    ENDPOINTS: {
        PREDICT: '/predict',
        SENTIMENT: '/sentiment',
        SIGNALS: '/signals',
        HEALTH: '/health'
    }
};

export default config; 