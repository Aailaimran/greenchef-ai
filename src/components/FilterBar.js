import React from 'react';

const FilterBar = ({ diet, setDiet, cuisine, setCuisine, mealType, setMealType }) => {
  return (
    <div className="filter-bar glass-card">
      <div className="filter-group">
        <label>Diet Style</label>
        <select value={diet} onChange={(e) => setDiet(e.target.value)}>
          {['None', 'Vegetarian', 'Vegan', 'Keto', 'Low Carb', 'High Protein'].map((d) =>
            <option key={d}>{d}</option>
          )}
        </select>
      </div>
      <div className="filter-group">
        <label>Cuisine</label>
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          {['Any', 'Pakistani', 'Italian', 'Chinese', 'Mexican', 'Indian', 'American'].map((c) =>
            <option key={c}>{c}</option>
          )}
        </select>
      </div>
      <div className="filter-group">
        <label>Meal Type</label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
          {['Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map((m) =>
            <option key={m}>{m}</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;