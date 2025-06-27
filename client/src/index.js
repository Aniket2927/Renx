import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Polyfill for ResizeObserver if not available
if (!window.ResizeObserver) {
  console.warn('ResizeObserver not available - charts may not render correctly');
  window.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.elements = [];
    }
    
    observe(element) {
      if (!this.elements.includes(element)) {
        this.elements.push(element);
        
        // Trigger the callback once to initialize
        setTimeout(() => {
          this.callback([{
            target: element,
            contentRect: {
              width: element.clientWidth,
              height: element.clientHeight
            }
          }]);
        }, 100);
      }
    }
    
    disconnect() {
      this.elements = [];
    }
    
    unobserve(element) {
      this.elements = this.elements.filter(el => el !== element);
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
