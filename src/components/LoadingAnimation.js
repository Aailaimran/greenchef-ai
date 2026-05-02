import React, { useState, useEffect } from 'react';

const skeletonCards = [1, 2, 3];

const steps = [
  "🧑‍🍳 Consulting our Michelin-star AI chef...",
  "📖 Writing detailed cooking instructions...",
  "🥄 Calculating perfect measurements...",
  "⏱️ Timing each cooking step precisely...",
  "✨ Adding professional chef tips...",
  "🍽️ Almost ready to serve your recipes!"
];

const LoadingAnimation = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-box">
      <p className="loading-text">{steps[stepIndex]}</p>
      <div className="skeleton-grid">
        {skeletonCards.map((item, idx) => (
          <div key={item} className="skeleton-card" style={{ animationDelay: `${idx * 0.15}s` }}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton skeleton-line long" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line medium" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingAnimation;