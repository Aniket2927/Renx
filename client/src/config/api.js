const API_CONFIG = {
  BASE_URL: 'https://api.twelvedata.com',
  ENDPOINTS: {
    QUOTE: '/quote',
    TIME_SERIES: '/time_series',
    SYMBOL_SEARCH: '/symbol_search'
  },
  INTERVALS: {
    MINUTE: '1min',
    FIVE_MINUTES: '5min',
    FIFTEEN_MINUTES: '15min',
    THIRTY_MINUTES: '30min',
    HOUR: '1h',
    DAY: '1day',
    WEEK: '1week',
    MONTH: '1month'
  }
};

export default API_CONFIG; 