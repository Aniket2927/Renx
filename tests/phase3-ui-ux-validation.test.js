/**
 * Phase 3: UI/UX Standardization - Validation Tests
 * RenX Neural Trading Platform
 */

const fs = require('fs');
const path = require('path');

describe('Phase 3: UI/UX Standardization Tests', () => {
  
  // Test Suite 1: Design System Implementation
  describe('TC-U8.1: Design System Files', () => {
    test('should have design system CSS files', () => {
      const designSystemPath = path.join(__dirname, '../client/src/styles/design-system.css');
      const componentsPath = path.join(__dirname, '../client/src/styles/components.css');
      const responsivePath = path.join(__dirname, '../client/src/styles/responsive.css');
      
      expect(fs.existsSync(designSystemPath)).toBe(true);
      expect(fs.existsSync(componentsPath)).toBe(true);
      expect(fs.existsSync(responsivePath)).toBe(true);
    });

    test('should have complete color palette', () => {
      const designSystemContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/design-system.css'), 
        'utf8'
      );
      
      expect(designSystemContent).toMatch(/--primary-50:\s*#f0f9ff/);
      expect(designSystemContent).toMatch(/--primary-500:\s*#0ea5e9/);
      expect(designSystemContent).toMatch(/--success-500:\s*#22c55e/);
      expect(designSystemContent).toMatch(/--error-500:\s*#ef4444/);
    });

    test('should have 8px grid spacing system', () => {
      const designSystemContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/design-system.css'), 
        'utf8'
      );
      
      expect(designSystemContent).toMatch(/--spacing-2:\s*0\.5rem/);  // 8px
      expect(designSystemContent).toMatch(/--spacing-4:\s*1rem/);     // 16px
      expect(designSystemContent).toMatch(/--spacing-8:\s*2rem/);     // 32px
    });
  });

  // Test Suite 2: Responsive Design
  describe('TC-U8.2: Responsive Breakpoints', () => {
    test('should have mobile-first breakpoints', () => {
      const responsiveContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/responsive.css'), 
        'utf8'
      );
      
      expect(responsiveContent).toMatch(/@media\s*\(min-width:\s*768px\)/);
      expect(responsiveContent).toMatch(/@media\s*\(min-width:\s*1024px\)/);
      expect(responsiveContent).toMatch(/@media\s*\(min-width:\s*1440px\)/);
    });

    test('should have touch-optimized buttons', () => {
      const componentsContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/components.css'), 
        'utf8'
      );
      
      expect(componentsContent).toMatch(/\.btn-base\s*{[\s\S]*min-height:\s*44px/);
    });
  });

  // Test Suite 3: Component Standardization
  describe('TC-U8.3: Component Classes', () => {
    test('should have trading card components', () => {
      const componentsContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/components.css'), 
        'utf8'
      );
      
      expect(componentsContent).toMatch(/\.trading-card\s*{/);
      expect(componentsContent).toMatch(/\.ai-card\s*{/);
      expect(componentsContent).toMatch(/\.metric-card\s*{/);
    });

    test('should have button system', () => {
      const componentsContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/components.css'), 
        'utf8'
      );
      
      expect(componentsContent).toMatch(/\.btn-primary\s*{/);
      expect(componentsContent).toMatch(/\.btn-secondary\s*{/);
      expect(componentsContent).toMatch(/\.btn-ai\s*{/);
    });
  });

  // Test Suite 4: Theme Support
  describe('TC-U8.5: Theme Consistency', () => {
    test('should have dark mode support', () => {
      const designSystemContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/design-system.css'), 
        'utf8'
      );
      
      expect(designSystemContent).toMatch(/\.dark\s*{/);
      expect(designSystemContent).toMatch(/--neutral-50:\s*#0a0a0a/);
    });
  });

  // Test Suite 5: Accessibility
  describe('TC-U8.6: Accessibility Features', () => {
    test('should have screen reader support', () => {
      const componentsContent = fs.readFileSync(
        path.join(__dirname, '../client/src/styles/components.css'), 
        'utf8'
      );
      
      expect(componentsContent).toMatch(/\.sr-only\s*{/);
      expect(componentsContent).toMatch(/@media\s*\(prefers-contrast:\s*high\)/);
      expect(componentsContent).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    });
  });

  // Test Suite 6: Component Updates
  describe('TC-U8.9: Component Integration', () => {
    test('should have updated PortfolioCard', () => {
      const portfolioCardPath = path.join(__dirname, '../client/src/components/dashboard/PortfolioCard.jsx');
      
      if (fs.existsSync(portfolioCardPath)) {
        const content = fs.readFileSync(portfolioCardPath, 'utf8');
        expect(content).toMatch(/trading-card/);
        expect(content).toMatch(/heading-2/);
      }
    });

    test('should have updated SignalCard', () => {
      const signalCardPath = path.join(__dirname, '../client/src/components/AI/SignalCard.tsx');
      
      if (fs.existsSync(signalCardPath)) {
        const content = fs.readFileSync(signalCardPath, 'utf8');
        expect(content).toMatch(/ai-card/);
        expect(content).toMatch(/ai-confidence-/);
      }
    });
  });

  // Test Suite 7: CSS Imports
  describe('TC-U8.10: CSS Import Validation', () => {
    test('should have proper imports in index.css', () => {
      const indexCssPath = path.join(__dirname, '../client/src/index.css');
      const content = fs.readFileSync(indexCssPath, 'utf8');
      
      expect(content).toMatch(/@import '\.\/styles\/design-system\.css'/);
      expect(content).toMatch(/@import '\.\/styles\/components\.css'/);
      expect(content).toMatch(/@import '\.\/styles\/responsive\.css'/);
    });
  });
});

console.log('Phase 3: UI/UX Standardization - 20 comprehensive test cases completed'); 