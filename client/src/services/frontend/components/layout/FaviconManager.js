import React, { useEffect } from 'react';

// Create a base64 encoded PNG favicon for older browsers
const createBase64Favicon = () => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Draw a gradient background with rounded corners
  const gradient = ctx.createLinearGradient(0, 0, 32, 32);
  gradient.addColorStop(0, '#3498db');
  gradient.addColorStop(1, '#9b59b6');
  ctx.fillStyle = gradient;
  
  // Draw rounded rectangle (compatible with all browsers)
  const radius = 8;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(32 - radius, 0);
  ctx.quadraticCurveTo(32, 0, 32, radius);
  ctx.lineTo(32, 32 - radius);
  ctx.quadraticCurveTo(32, 32, 32 - radius, 32);
  ctx.lineTo(radius, 32);
  ctx.quadraticCurveTo(0, 32, 0, 32 - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  // Draw a simple chart line
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6, 22);
  ctx.lineTo(10, 18);
  ctx.lineTo(14, 20);
  ctx.lineTo(18, 12);
  ctx.lineTo(22, 16);
  ctx.lineTo(26, 10);
  ctx.stroke();
  
  // Draw a simplified brain icon
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(16, 10, 5, 0, Math.PI, true);
  ctx.stroke();
  
  // Draw the "brain connectors"
  ctx.beginPath();
  ctx.moveTo(11, 10);
  ctx.bezierCurveTo(9, 14, 10, 16, 12, 16);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(21, 10);
  ctx.bezierCurveTo(23, 14, 22, 16, 20, 16);
  ctx.stroke();
  
  // Draw "eyes"
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(14, 10, 1, 0, 2 * Math.PI);
  ctx.arc(18, 10, 1, 0, 2 * Math.PI);
  ctx.fill();
  
  // Convert to base64 data URL
  return canvas.toDataURL('image/png');
};

const FaviconManager = () => {
  useEffect(() => {
    // Create SVG favicon for modern browsers
    const svgContent = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3498db" />
            <stop offset="100%" stop-color="#9b59b6" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect x="0" y="0" width="100" height="100" rx="20" fill="url(#bgGradient)" />
        
        <!-- Circuit Board Pattern -->
        <path d="M15 25 L35 25 M35 25 L35 45 M35 45 L55 45 M55 45 L55 65 M55 65 L75 65" 
              stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" />
        <circle cx="15" cy="25" r="3" fill="white" opacity="0.6" />
        <circle cx="35" cy="25" r="3" fill="white" opacity="0.6" />
        <circle cx="35" cy="45" r="3" fill="white" opacity="0.6" />
        <circle cx="55" cy="45" r="3" fill="white" opacity="0.6" />
        <circle cx="55" cy="65" r="3" fill="white" opacity="0.6" />
        <circle cx="75" cy="65" r="3" fill="white" opacity="0.6" />
        
        <!-- Stock Chart -->
        <polyline points="20,70 30,60 40,65 50,45 60,55 70,35 80,30" 
                 stroke="white" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round" />
        
        <!-- Brain/AI symbol -->
        <path d="M50 25 C60 25, 65 15, 60 10 C55 5, 45 5, 40 10 C35 15, 40 25, 50 25" 
              stroke="white" stroke-width="2" fill="none" />
        <path d="M40 10 C35 20, 30 15, 35 25" 
              stroke="white" stroke-width="2" fill="none" />
        <path d="M60 10 C65 20, 70 15, 65 25" 
              stroke="white" stroke-width="2" fill="none" />
        <circle cx="45" cy="18" r="2" fill="white" />
        <circle cx="55" cy="18" r="2" fill="white" />
      </svg>
    `;
    
    // Create the SVG favicon link
    const svgLink = document.createElement('link');
    svgLink.rel = 'icon';
    svgLink.type = 'image/svg+xml';
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    svgLink.href = svgUrl;
    
    // Create a PNG fallback favicon for older browsers
    const pngLink = document.createElement('link');
    pngLink.rel = 'icon';
    pngLink.type = 'image/png';
    pngLink.href = createBase64Favicon();
    
    // Add them to the head
    const head = document.head || document.getElementsByTagName('head')[0];
    
    // Remove existing favicons
    const existingIcons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingIcons.forEach(icon => icon.parentNode.removeChild(icon));
    
    // Add new favicons
    head.appendChild(pngLink); // Fallback first
    head.appendChild(svgLink); // Modern browsers will prefer this
    
    // Update the page title as well
    document.title = "RenX AI Trading";
    
    // Clean up on unmount
    return () => {
      URL.revokeObjectURL(svgUrl);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default FaviconManager; 