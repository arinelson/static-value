
import React from 'react';

const HolographicEffect: React.FC = () => {
  return (
    <div className="holographic-container absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <div className="holographic-beam"></div>
      <div className="holographic-lines">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i} 
            className="holographic-line"
            style={{
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              height: `${Math.random() * 2 + 0.5}px`
            }}
          ></div>
        ))}
      </div>
      <div className="holographic-glow"></div>
    </div>
  );
};

export default HolographicEffect;
