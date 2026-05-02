import React, { useMemo, useRef, useState } from 'react';
import './App.css';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import FilterBar from './components/FilterBar';
import LoadingAnimation from './components/LoadingAnimation';
import axios from 'axios';

function App() {
  const [ingredients, setIngredients]             = useState([]);
  const [recipes, setRecipes]                     = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');
  const [diet, setDiet]                           = useState('None');
  const [cuisine, setCuisine]                     = useState('Any');
  const [mealType, setMealType]                   = useState('Any');
  const [favorites, setFavorites]                 = useState([]);
  const [activeRecipe, setActiveRecipe]           = useState(null);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [viewMode, setViewMode]                   = useState('list');
  const [sortBy, setSortBy]                       = useState('prepTime');
  const [activePage, setActivePage]               = useState('home');

  const inputRef   = useRef(null);
  const resultsRef = useRef(null);

  const featureList = [
    'AI-powered recipe ideas',
    'Dietary filters',
    'Smart shopping list',
    'Fast prep options',
    'Ingredient-first cooking',
  ];

  /* ── helpers ──────────────────────────────────────────── */
  const toggleFavorite = (recipeName) => {
    setFavorites((prev) =>
      prev.includes(recipeName)
        ? prev.filter((n) => n !== recipeName)
        : [...prev, recipeName]
    );
  };

  const favoriteCount   = favorites.length;
  const favoriteRecipes = useMemo(
    () => recipes.filter((r) => favorites.includes(r.name)),
    [favorites, recipes]
  );

  const openRecipeModal  = (recipe, index) => { setActiveRecipe(recipe); setActiveRecipeIndex(index); };
  const closeRecipeModal = () => setActiveRecipe(null);

  const scrollToInput = () => {
    setActivePage('home');
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };



  const parseMinutes = (val) => {
    const m = String(val || '').match(/\d+/);
    return m ? Number(m[0]) : 999;
  };

  const sortedRecipes = [...recipes].sort((a, b) =>
    sortBy === 'prepTime' ? parseMinutes(a.prepTime) - parseMinutes(b.prepTime) : 0
  );

  /* ── API call ─────────────────────────────────────────── */
  const generateRecipes = async () => {
    if (ingredients.length === 0) { setError('Please add at least one ingredient!'); return; }
    setLoading(true);
    setError('');
    setRecipes([]);

    const prompt = `
Generate exactly 3 recipes using these
ingredients: ${ingredients.join(', ')}.

Diet: ${diet}
Cuisine: ${cuisine}  
Meal Type: ${mealType}

Respond with ONLY this JSON structure:
[
  {
    "name": "Recipe Name",
    "emoji": "🍕",
    "description": "Short one line description",
    "prepTime": "15 mins",
    "cookTime": "30 mins",
    "servings": "4",
    "difficulty": "Easy",
    "calories": "350 per serving",
    "ingredients": [
      "200g ingredient name",
      "2 tbsp ingredient name"
    ],
    "steps": [
      "Step 1: Do this",
      "Step 2: Do that",
      "Step 3: Finish like this"
    ],
    "tips": "One helpful cooking tip"
  }
]

IMPORTANT: Start your response with [ 
and end with ] only. Nothing else.
`;

    try {
      const models = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'gemma2-9b-it'
      ];

      let response = null;
      let lastError = null;

      for (const model of models) {
        try {
          console.log('Trying model:', model);
          response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: model,
              messages: [
                {
                  role: 'system',
                  content: `You are a professional chef.
You must respond with ONLY a valid JSON array.
Absolutely no other text.
No markdown formatting.
No backticks or code blocks.
No explanation or introduction.
Your entire response must start with [
and end with ]
Each recipe object must have these exact fields:
name, emoji, description, prepTime, cookTime,
servings, difficulty, calories, ingredients,
steps, tips`
                },
                {
                  role: 'user', 
                  content: prompt
                }
              ],
              max_tokens: 2500,
              temperature: 0.7,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            }
          );
          console.log('Success with model:', model);
          console.log('Groq status:', response.status);
          console.log('Groq model used:', response.data.model);
          console.log('Raw response:', response.data.choices[0].message.content.substring(0, 300));
          break;
        } catch (modelErr) {
          console.error(`Model ${model} failed:`, modelErr.response?.status);
          lastError = modelErr;
          if (modelErr.response?.status !== 400 && 
              modelErr.response?.status !== 503) {
            throw modelErr;
          }
        }
      }

      if (!response) {
        throw lastError;
      }

      const raw = response.data.choices[0].message.content;
      console.log('Raw response preview:', raw.substring(0, 200));

      let clean = raw
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      const startIndex = clean.indexOf('[');
      const endIndex = clean.lastIndexOf(']');

      if (startIndex === -1 || endIndex === -1) {
        throw new Error('No valid JSON array in response');
      }

      clean = clean.substring(startIndex, endIndex + 1);
      const recipes = JSON.parse(clean);

      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw new Error('No recipes returned');
      }

      setRecipes(recipes);
      setError('');

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);

    } catch (err) {
      console.error('Full error:', err.response?.data || err.message);
      
      const status = err.response?.status;
      const errMsg = err.response?.data?.error?.message || '';

      if (status === 401) {
        setError('Invalid Groq API key. Check Vercel environment variables.');
      } else if (status === 400) {
        setError('Request failed. The AI model may have changed. Please try again.');
        console.error('Bad request details:', err.response?.data);
      } else if (status === 429) {
        setError('Too many requests. Please wait 30 seconds and try again.');
      } else if (status === 503) {
        setError('Groq service is busy. Please try again in a moment.');
      } else if (err.message?.includes('JSON')) {
        setError('AI returned unexpected format. Please try again.');
      } else {
        setError(`Error: ${errMsg || err.message || 'Something went wrong. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── shared recipe list renderer ─────────────────────── */
  const RecipeList = ({ list }) => (
    <div className={`recipes-list ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
      {list.map((recipe, i) => (
        <RecipeCard
          key={`${recipe.name}-${i}`}
          recipe={recipe}
          index={i}
          recipeNumber={i + 1}
          isFavorite={favorites.includes(recipe.name)}
          onToggleFavorite={toggleFavorite}
          onOpenModal={openRecipeModal}
          cuisineTag={cuisine !== 'Any' ? cuisine : (recipe.cuisine || 'Global')}
          viewMode={viewMode}
        />
      ))}
    </div>
  );

  /* ── empty-state helper ───────────────────────────────── */
  const EmptyState = ({ icon, message, showCta = true }) => (
    <div className="empty-state">
      {icon}
      <p>{message}</p>
      {showCta && (
        <button className="start-cooking-btn" onClick={scrollToInput}>
          Start Cooking
        </button>
      )}
    </div>
  );

  /* ── page panels ──────────────────────────────────────── */
  const MyRecipesPage = () => (
    <section className="page-panel">
      <div className="page-copy">
        <h2 className="page-title">My Recipes</h2>
        <p className="page-subtitle">Recipes you generate will appear here</p>
      </div>
      {recipes.length === 0 ? (
        <EmptyState
          icon={
            <svg width="96" height="96" viewBox="0 0 24 24" fill="none"
              stroke="#2D6A4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 0111.18 0A4 4 0 0118 13.87V21H6z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
          }
          message="No recipes yet — generate your first one!"
        />
      ) : (
        <div className="results-section">
          <RecipeList list={recipes} />
        </div>
      )}
    </section>
  );

  const FavoritesPage = () => (
    <section className="page-panel">
      <div className="page-copy">
        <h2 className="page-title">Favorites ({favoriteCount})</h2>
      </div>
      {favoriteCount === 0 ? (
        <EmptyState
          icon={
            <svg width="96" height="96" viewBox="0 0 24 24" fill="none"
              stroke="#2D6A4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          }
          message="Save recipes you love by clicking the ♡ on any recipe card"
          showCta={false}
        />
      ) : (
        <div className="results-section">
          <RecipeList list={favoriteRecipes} />
        </div>
      )}
    </section>
  );

  /* ── home page ────────────────────────────────────────── */
  const HomePage = () => (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-kicker">Cook Smarter</p>
          <h1>Turn Your Pantry Into Signature Dishes</h1>
        </div>
      </header>

      {/* MAIN CONTENT GRID — below hero, no overlap */}
      <section className="content-grid">
        {/* LEFT SIDEBAR */}
        <aside className="left-sidebar glass-card">
          <h3>Platform Features</h3>
          <ul>
            {featureList.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </aside>

        {/* CENTER */}
        <section className="center-panel">
          <div ref={inputRef}>
            <FilterBar
              diet={diet}       setDiet={setDiet}
              cuisine={cuisine} setCuisine={setCuisine}
              mealType={mealType} setMealType={setMealType}
            />
            <IngredientInput
              ingredients={ingredients}
              setIngredients={setIngredients}
              onGenerate={generateRecipes}
              loading={loading}
            />
            {error && <p className="error-msg">{error}</p>}
            {loading && <LoadingAnimation />}
          </div>

          {recipes.length > 0 && (
            <section ref={resultsRef} className="results-section">
              {/* summary banner */}
              <div className="summary-banner">
                <p>✨ Generated {recipes.length} recipes using: {ingredients.join(' · ')}</p>
              </div>

              {/* results header row */}
              <div className="results-header-row">
                <h2 className="results-title">{recipes.length} Recipes Found</h2>
                <div className="results-controls">
                  <div className="view-toggle-group" role="group" aria-label="Recipe layout toggle">
                    <button
                      className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6"  x2="21" y2="6"  />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <circle cx="4" cy="6"  r="1" />
                        <circle cx="4" cy="12" r="1" />
                        <circle cx="4" cy="18" r="1" />
                      </svg>
                    </button>
                    <button
                      className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <rect x="3"  y="3"  width="7" height="7" />
                        <rect x="14" y="3"  width="7" height="7" />
                        <rect x="3"  y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                  </div>

                  <label className="sort-wrap">
                    <span>Sort by:</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="prepTime">Prep Time</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* recipe cards */}
              <RecipeList list={sortedRecipes} />
            </section>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="right-sidebar glass-card">
          <h3>Smart Pantry</h3>
          <div className="stat-block">
            <p>Ingredients Added</p>
            <strong>{ingredients.length}</strong>
          </div>
          <div className="stat-block">
            <p>Saved Favorites</p>
            <strong>{favorites.length}</strong>
          </div>
          <div className="stat-block">
            <p>Recipe Results</p>
            <strong>{recipes.length}</strong>
          </div>
        </aside>
      </section>
    </>
  );

  /* ── render ───────────────────────────────────────────── */
  return (
    <div className="app-shell">
      {/* top accent line */}
      <div className="top-accent-bar" />

      {/* NAVBAR — brand name only, no nav links */}
      <nav className="top-nav">
        <div className="brand-wrap">
          <span className="brand">GreenChef AI</span>
        </div>
        <div className="nav-right">
          <button
            className="nav-cta-btn"
            onClick={scrollToInput}
            disabled={loading}
          >
            Generate Recipe
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="content-shell">
        {activePage === 'myrecipes' ? (
          <MyRecipesPage />
        ) : activePage === 'favorites' ? (
          <FavoritesPage />
        ) : (
          <HomePage />
        )}
      </main>

      {/* FOOTER — simplified, no links */}
      <footer className="footer">
        <div className="footer-simple">
          <div className="footer-brand">
            <h4>GreenChef AI</h4>
            <p>Cook smarter with AI · Generated By Syeda Aaila · Powered by OpenAi</p>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} GreenChef AI. All rights reserved.</p>
        </div>
      </footer>

      {/* RECIPE MODAL */}
      {activeRecipe && (
        <RecipeModal
          recipe={activeRecipe}
          index={activeRecipeIndex}
          onClose={closeRecipeModal}
        />
      )}

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <button
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => setActivePage('home')}
        >
          Home
        </button>
        <button
          className={activePage === 'myrecipes' ? 'active' : ''}
          onClick={() => setActivePage('myrecipes')}
        >
          My Recipes
        </button>
        <button
          className={activePage === 'favorites' ? 'active' : ''}
          onClick={() => setActivePage('favorites')}
        >
          Favorites {favoriteCount > 0 && `(${favoriteCount})`}
        </button>
        <button onClick={scrollToInput}>Generate</button>
      </nav>
    </div>
  );
}

export default App;