import React from 'react';

const skeletonCards = [1, 2, 3];

const LoadingAnimation = () => {
  return (
    <div className="loading-box">
      <p className="loading-text">Building beautiful recipes for you...</p>
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