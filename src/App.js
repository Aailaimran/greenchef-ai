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
Create exactly 3 detailed restaurant-quality 
recipes using these ingredients: ${ingredients.join(', ')}.

Filters:
- Diet: ${diet}
- Cuisine: ${cuisine}
- Meal Type: ${mealType}

CRITICAL REQUIREMENTS FOR EACH RECIPE:

1. STEPS must be detailed cooking instructions:
   - Minimum 8 steps, maximum 12 steps
   - Each step must be 2-3 sentences minimum
   - Include exact cooking temperature 
     (e.g. "medium-high heat, around 180°C")
   - Include exact timing 
     (e.g. "cook for exactly 4-5 minutes")
   - Include visual cues 
     (e.g. "until golden brown and crispy")
   - Include technique details
     (e.g. "stir constantly to prevent burning")
   - Explain why each step matters
     (e.g. "this seals in the juices")

2. INGREDIENTS must include:
   - Exact measurements (grams, cups, tbsp)
   - At least 6-8 ingredients per recipe
   - Preparation notes 
     (e.g. "2 cloves garlic, finely minced")

3. DESCRIPTION must be 2-3 sentences describing
   the dish, its flavors and textures

4. TIPS must be a detailed professional tip
   of at least 2-3 sentences

Return ONLY this exact JSON structure:
[
  {
    "name": "Full Recipe Name",
    "emoji": "🍗",
    "description": "A rich and flavorful dish that combines the smokiness of grilled chicken with the freshness of herbs. Perfect for a weeknight dinner that feels restaurant-quality. The secret is in the marinade that tenderizes the meat perfectly.",
    "prepTime": "20 mins",
    "cookTime": "35 mins",
    "servings": "4",
    "difficulty": "Medium",
    "calories": "420 per serving",
    "ingredients": [
      "500g chicken breast, cut into 2cm cubes",
      "3 cloves garlic, finely minced",
      "2 tbsp olive oil, extra virgin",
      "1 tsp smoked paprika",
      "1 medium onion, finely diced",
      "200ml chicken stock, low sodium",
      "2 tbsp fresh lemon juice",
      "Salt and black pepper to taste"
    ],
    "steps": [
      "Prepare the marinade: In a large mixing bowl, combine the minced garlic, olive oil, smoked paprika, and lemon juice. Whisk everything together until fully combined. The acid in the lemon juice will help tenderize the chicken while the oil carries the flavors deep into the meat.",
      "Marinate the chicken: Add the chicken cubes to the marinade and toss well to coat every piece evenly. Cover the bowl with plastic wrap and refrigerate for at least 15 minutes, or up to 2 hours for deeper flavor. The longer it marinates, the more flavorful and tender your chicken will be.",
      "Prepare your vegetables: While the chicken marinates, finely dice the onion into small even pieces about 5mm in size. Uniform cutting ensures everything cooks at the same rate. Set aside on a clean cutting board.",
      "Heat your pan: Place a large heavy-bottomed skillet or cast iron pan over medium-high heat and let it heat for 2 full minutes until very hot. A properly heated pan creates a beautiful sear that locks in the juices. You will know it is ready when a drop of water immediately sizzles and evaporates.",
      "Sear the chicken: Add the marinated chicken pieces in a single layer - do not overcrowd the pan or the chicken will steam instead of sear. Cook undisturbed for 3-4 minutes until a golden-brown crust forms on the bottom. Flip each piece and cook for another 3 minutes until cooked through and no longer pink inside.",
      "Cook the aromatics: Remove the chicken and set aside on a warm plate covered with foil. In the same pan with all the flavorful browned bits, add the diced onion. Cook over medium heat for 5-6 minutes, stirring occasionally, until the onions are soft and translucent and just starting to turn golden.",
      "Deglaze and make the sauce: Pour the chicken stock into the pan and use a wooden spoon to scrape up all the caramelized bits from the bottom of the pan - this is called deglazing and adds incredible depth of flavor. Bring to a gentle simmer and let it reduce for 3-4 minutes until the sauce thickens slightly and coats the back of a spoon.",
      "Combine and finish: Return the seared chicken to the pan and toss gently to coat in the sauce. Reduce heat to low and cook for 2 more minutes just to heat everything through and let the flavors meld together. Taste and adjust seasoning with salt and black pepper as needed.",
      "Rest and serve: Remove from heat and let the dish rest for 2 minutes before serving - this allows the juices to redistribute throughout the meat so every bite is juicy. Serve immediately over rice or with crusty bread to soak up the delicious sauce.",
      "Garnish and plate: Transfer to warm serving plates and garnish with freshly chopped parsley and a wedge of lemon on the side. A drizzle of good quality olive oil right before serving adds a beautiful sheen and extra richness to the final dish."
    ],
    "tips": "For the best results, take the chicken out of the refrigerator 10 minutes before cooking to bring it to room temperature - cold chicken straight from the fridge will lower the pan temperature and prevent proper searing. Always use a meat thermometer to check doneness - chicken is safe to eat at an internal temperature of 74°C (165°F). Leftovers can be stored in an airtight container in the refrigerator for up to 3 days and actually taste even better the next day as the flavors continue to develop."
  }
]

REMEMBER: Return ONLY the JSON array.
No text before, no text after.
Start with [ and end with ]
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
                  content: `You are a Michelin-star professional 
chef writing detailed cooking guides for beginners.

STRICT OUTPUT RULES:
- Respond with ONLY a valid JSON array
- No markdown, no backticks, no extra text
- Start with [ and end with ] only

RECIPE QUALITY RULES:
- Each recipe must have 8 to 12 detailed steps
- Each step must be at least 2-3 sentences long
- Steps must include exact temperatures, times,
  and techniques
- Steps must explain WHY you are doing each action
- Include visual cues so cook knows when its done
- Ingredients must have exact measurements
- Must include at least 6 ingredients per recipe
- Tips must be detailed and professional`
                },
                {
                  role: 'user', 
                  content: prompt
                }
              ],
              max_tokens: 4000,
              temperature: 0.8,
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
