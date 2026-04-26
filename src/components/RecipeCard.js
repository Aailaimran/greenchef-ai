import React, { useState } from 'react';

const foodImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
];

const RecipeCard = ({
  recipe,
  index,
  recipeNumber,
  isFavorite,
  onToggleFavorite,
  onOpenModal,
  cuisineTag,
  viewMode,
}) => {
  const [imageIndex, setImageIndex] = useState(index % foodImages.length);
  const [heartPulse, setHeartPulse] = useState(false);
  const statsAnimated = true;

  const getDifficultyClass = (difficulty = '') => {
    const level = difficulty.toLowerCase();
    if (level.includes('hard')) return 'hard';
    if (level.includes('medium')) return 'medium';
    return 'easy';
  };

  const imageUrl = foodImages[imageIndex % foodImages.length];

  const difficultyClass = getDifficultyClass(recipe.difficulty);
  const ingredients = recipe.ingredients || [];
  const ingredientPreview = ingredients.slice(0, 4);
  const remainingIngredients = Math.max(ingredients.length - 4, 0);

  const handleImageError = () => {
    setImageIndex((prev) => (prev + 1) % foodImages.length);
  };

  const handleFavoriteToggle = () => {
    setHeartPulse(true);
    onToggleFavorite(recipe.name);
    setTimeout(() => setHeartPulse(false), 260);
  };

  const statItems = [
    {
      label: 'Prep Time',
      value: recipe.prepTime,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: 'Cook Time',
      value: recipe.cookTime,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2c0 6-6 6-6 12a6 6 0 0012 0c0-6-6-6-6-12z" />
        </svg>
      ),
    },
    {
      label: 'Serves',
      value: recipe.servings,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: 'Calories',
      value: recipe.calories,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <article className={`recipe-row-card ${viewMode === 'grid' ? 'grid-card' : ''}`} style={{ animationDelay: `${index * 0.12}s` }}>
      <div className="recipe-media">
        <img src={imageUrl} alt={recipe.name} className="recipe-image" onError={handleImageError} />
        <div className="recipe-image-gradient" />
        <span className={`difficulty-badge ${difficultyClass}`}>
          {recipe.difficulty || 'Easy'}
        </span>
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''} ${heartPulse ? 'pulse' : ''}`}
          onClick={handleFavoriteToggle}
          aria-label={`Favorite ${recipe.name}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? '#EF4444' : 'none'} stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="recipe-body">
        <div className="recipe-top-row">
          <span className="recipe-number-pill">{String(recipeNumber).padStart(2, '0')}</span>
          <span className="cuisine-pill">{cuisineTag}</span>
        </div>

        <h3 className="recipe-name">{recipe.name}</h3>
        <p className="recipe-desc">{recipe.description}</p>

        <div className="recipe-meta-row">
          {statItems.map((item) => (
            <div key={item.label} className={`stat-pill ${statsAnimated ? 'animate' : ''}`}>
              {item.icon}
              <div>
                <p className="stat-label">{item.label}</p>
                <strong className="stat-value">{item.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="recipe-ingredients-preview">
          <p className="uses-label">USES</p>
          <div className="ingredients-pills">
            {ingredientPreview.map((ing, idx) => (
              <span key={`${ing}-${idx}`} className="ingredient-preview-tag" style={{ animationDelay: `${idx * 0.05}s` }}>
                {ing}
              </span>
            ))}
            {remainingIngredients > 0 && (
              <span className="ingredient-preview-tag">+ {remainingIngredients} more</span>
            )}
          </div>
        </div>

        <div className="recipe-actions-row">
          <button className="view-link-btn" onClick={() => onOpenModal(recipe, index)}>
            View Full Recipe
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button className="view-steps-btn" onClick={() => onOpenModal(recipe, index)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 0111.18 0A4 4 0 0118 13.87V21H6z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
            View Steps
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;