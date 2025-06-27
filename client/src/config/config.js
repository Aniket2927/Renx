const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8181',
    ENDPOINTS: {
        PREDICT: '/predict',
        SENTIMENT: '/sentiment',
        SIGNALS: '/signals',
        HEALTH: '/health'
    }
};

export default config; 