import React, { useState } from 'react';

const suggestions = [
  'Chicken', 'Rice', 'Tomato', 'Onion', 'Garlic',
  'Pasta', 'Eggs', 'Cheese', 'Spinach', 'Potatoes',
  'Mushroom', 'Lemon', 'Broccoli', 'Salmon', 'Basil'
];

const blocklist = [
  'trump', 'biden', 'obama', 'elon', 'musk', 'google',
  'facebook', 'javascript', 'python', 'react', 'html',
  'css', 'code', 'computer', 'phone', 'car', 'money',
  'dollar', 'crypto', 'bitcoin', 'war', 'politics',
  'president', 'minister', 'government', 'country'
];

const knownPeople = ['trump', 'biden', 'elon', 'obama', 'musk'];
const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
const questionPattern = /\b(who|what|where|when|why|how)\b/i;
const numberOnlyPattern = /^\d+$/;
const disallowedSpecialPattern = /[@#$%^&*()]/;

const IngredientInput = ({ ingredients, setIngredients, onGenerate, loading }) => {
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateIngredient = (rawInput) => {
    const val = rawInput.trim();
    const lowerVal = val.toLowerCase();

    if (val.length < 2) {
      return { valid: false, message: "That's too short to be an ingredient!" };
    }

    if (val.length > 30) {
      return { valid: false, message: 'Please enter a food ingredient only 🥕' };
    }

    if (knownPeople.some((name) => lowerVal.includes(name)) || namePattern.test(val)) {
      return { valid: false, message: "That looks like a person's name, not an ingredient! 🙅" };
    }

    if (questionPattern.test(lowerVal) || /[?!]/.test(val)) {
      return { valid: false, message: "Ingredients can't contain questions!" };
    }

    if (numberOnlyPattern.test(val)) {
      return { valid: false, message: 'Please enter a food ingredient only 🥕' };
    }

    if (disallowedSpecialPattern.test(val)) {
      return { valid: false, message: 'No special characters allowed in ingredients!' };
    }

    if (blocklist.includes(lowerVal)) {
      return { valid: false, message: 'Please enter a food ingredient only 🥕' };
    }

    if (ingredients.some((item) => item.toLowerCase() === lowerVal)) {
      return { valid: false, message: 'This ingredient is already in your list.' };
    }

    return { valid: true, message: '' };
  };

  const showValidationError = (message) => {
    setValidationError(message);
    setTimeout(() => {
      setValidationError('');
    }, 3000);
  };

  const addIngredient = () => {
    const val = input.trim();
    if (!val) return;

    const validationResult = validateIngredient(val);
    if (!validationResult.valid) {
      showValidationError(validationResult.message);
      return;
    }

    setIngredients([...ingredients, val]);
    setInput('');
  };

  const removeIngredient = (item) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addIngredient();
  };

  const addSuggestion = (item) => {
    setInput(item);
    const validationResult = validateIngredient(item);
    if (!validationResult.valid) {
      showValidationError(validationResult.message);
      return;
    }
    setIngredients([...ingredients, item]);
    setInput('');
  };

  return (
    <div className="input-card">
      <h2 className="section-title">What ingredients are in your kitchen?</h2>

      <div className="input-row">
        <input
          type="text"
          className={`ingredient-input ${validationError ? 'invalid' : ''}`}
          placeholder="Type an ingredient e.g. chicken..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (validationError) {
              setValidationError('');
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <button className="add-btn" onClick={addIngredient}>Add</button>
      </div>

      {validationError && <p className="validation-error">{validationError}</p>}

      <div className="quick-add">
        <p className="quick-label">Popular ingredients</p>
        <div className="popular-grid">
          {suggestions.map((s) => (
            <button
              key={s}
              className="chip"
              onClick={() => addSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="ingredients-list">
          <p className="quick-label">Selected ingredients ({ingredients.length})</p>
          <div className="chips-row">
            {ingredients.map((item, idx) => (
              <span key={item} className="ingredient-tag">
                {item}
                <button
                  className="remove-btn"
                  onClick={() => removeIngredient(item)}
                  aria-label={`Remove ${item}`}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        className="generate-btn"
        onClick={onGenerate}
        disabled={loading || ingredients.length === 0}
      >
        {loading ? 'Generating recipes...' : '✨ Generate Recipes'}
      </button>
    </div>
  );
};

export default IngredientInput;