import { describe, it, expect, beforeEach } from '@jest/globals';
import { AIService } from '../services/aiService';

describe('AIService Unit Tests', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('Service Initialization', () => {
    it('should create AIService instance', () => {
      expect(aiService).toBeInstanceOf(AIService);
    });

    it('should have analyzeSentiment method', () => {
      expect(typeof aiService.analyzeSentiment).toBe('function');
    });

    it('should have analyzePortfolioRisk method', () => {
      expect(typeof aiService.analyzePortfolioRisk).toBe('function');
    });

    it('should have generateTradingSignal method', () => {
      expect(typeof aiService.generateTradingSignal).toBe('function');
    });
  });

  describe('Basic Functionality', () => {
    it('should return neutral sentiment for empty text', async () => {
      const result = await aiService.analyzeSentiment('');
      expect(result).toBe('0');
    });

    it('should handle empty portfolio risk analysis', async () => {
      const result = await aiService.analyzePortfolioRisk([]);
      // Empty portfolio returns fallback values when backend is unavailable
      expect(result.riskScore).toBe(50);
      expect(result.diversificationScore).toBe(50);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations[0]).toContain('Consider adding more positions');
    });
  });
});
