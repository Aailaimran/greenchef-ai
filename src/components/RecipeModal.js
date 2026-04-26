import React, { useMemo, useState } from 'react';

const foodImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
];

const getDifficultyClass = (difficulty = '') => {
  const level = difficulty.toLowerCase();
  if (level.includes('hard')) return 'hard';
  if (level.includes('medium')) return 'medium';
  return 'easy';
};

const RecipeModal = ({ recipe, index, onClose }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [imageIndex, setImageIndex] = useState(index % foodImages.length);

  const difficultyClass = getDifficultyClass(recipe.difficulty);
  const imageUrl = foodImages[imageIndex % foodImages.length];
  const ingredients = useMemo(() => recipe.ingredients || [], [recipe.ingredients]);
  const steps = useMemo(() => recipe.steps || [], [recipe.steps]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('recipe-modal-overlay')) {
      onClose();
    }
  };

  const handleImageError = () => {
    setImageIndex((prev) => (prev + 1) % foodImages.length);
  };

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="recipe-modal-overlay" onClick={handleOverlayClick}>
      <div className="recipe-modal" role="dialog" aria-modal="true" aria-label={recipe.name}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close recipe modal">
          x
        </button>

        <div className="recipe-modal-header">
          <img src={imageUrl} alt={recipe.name} className="recipe-modal-image" onError={handleImageError} />
          <div className="recipe-modal-image-overlay" />
          <span className={`difficulty-badge ${difficultyClass}`}>
            {recipe.difficulty || 'Easy'}
          </span>
          <div className="recipe-modal-title-wrap">
            <span className="recipe-modal-emoji">{recipe.emoji || '🍽️'}</span>
            <h2>{recipe.name}</h2>
          </div>
        </div>

        <div className="recipe-modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button
            className={`modal-tab ${activeTab === 'steps' ? 'active' : ''}`}
            onClick={() => setActiveTab('steps')}
          >
            Steps
          </button>
        </div>

        <div className="recipe-modal-content">
          {activeTab === 'ingredients' ? (
            <div className="modal-tab-panel">
              <ul className="modal-ingredient-list">
                {ingredients.map((ingredient, idx) => (
                  <li
                    key={`${ingredient}-${idx}`}
                    className={`modal-ingredient-item ${checkedIngredients[idx] ? 'checked' : ''}`}
                    onClick={() => toggleIngredientCheck(idx)}
                  >
                    <span className="checkmark-dot">{checkedIngredients[idx] ? '✓' : ''}</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="modal-tab-panel">
              <ol className="modal-steps-list">
                {steps.map((step, idx) => (
                  <li key={`${step}-${idx}`}>
                    <span className="step-number">{idx + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
