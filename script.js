document.getElementById("searchBtn").addEventListener("click", function() {
    let query = document.getElementById("searchBox").value;
    let resultsDiv = document.getElementById("results");
    let timeValue = document.getElementById('timeFilter')?.value;

    resultsDiv.innerHTML = "<p>Searching recipes for <b>" + query + "</b>...</p>";

    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + query)
    .then(res => res.json())
    .then(data => {
        let meals = data.meals;

        if (!meals) {
            resultsDiv.innerHTML = "<p>No recipes found. Try again!</p>";
            return;
        }

        // Apply time filter to search results
        if (timeValue) {
            meals = meals.filter(meal => {
                const text = (meal.strMeal + ' ' + (meal.strInstructions || '')).toLowerCase();
                let time = 45; // default
                
                if (text.includes('salad') || text.includes('quick') || text.includes('fast') || text.includes('easy')) time = 20;
                else if (text.includes('bake') || text.includes('roast') || text.includes('grill') || text.includes('pasta')) time = 45;
                else if (text.includes('stew') || text.includes('slow') || text.includes('braise') || text.includes('simmer')) time = 90;
                
                if (timeValue === 'quick') return time <= 30;
                if (timeValue === 'medium') return time > 30 && time <= 60;
                if (timeValue === 'long') return time > 60;
                return true;
            });
        }
        
        currentMeals = meals;
        displayMeals(meals);
    })
    .catch(err => {
       resultsDiv.innerHTML = `
  <div class="error-overlay">
    <div class="error-card">
      <h3>⚠ Unable to load recipes</h3>
      <p>Something went wrong while fetching recipes.</p>
      <p>Please check your connection and try again.</p>
      <button id="retryBtn">Retry</button>
    </div>
  </div>
`;

document.getElementById("retryBtn").addEventListener("click", () => {
    window.location.reload();
});
    });
});

// Clear button functionality
const clearBtn = document.getElementById("clearBtn");
const searchBox = document.getElementById("searchBox");
const resultsDiv = document.getElementById("results");

clearBtn.addEventListener("click", function () {
    searchBox.value = "";        // clears input
    resultsDiv.innerHTML = "";   // clears search results
    document.getElementById('timeFilter').value = ""; // reset time filter
    window.dispatchEvent(new Event("load")); // reload all recipes
});

function displayMeals(meals, showInstructions = true) {
    resultsDiv.innerHTML = "";

    meals.forEach(meal => {
        let div = document.createElement("div");
        div.classList.add("recipe-card");
        
        // Add estimated time
        const estTime = estimateTime(meal);
        let timeBadge = '';
        if (estTime <= 30) timeBadge = '⚡ Quick';
        else if (estTime <= 60) timeBadge = '⏱️ Medium';
        else timeBadge = '🕒 Long';

        div.innerHTML = `
            <a href="product-detail.html?name=${encodeURIComponent(meal.strMeal)}" class="recipe-link">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>${meal.strMeal}</h3>
                <div class="time-badge">${timeBadge} (${estTime} min)</div>
                ${showInstructions ? `<p>${meal.strInstructions.substring(0, 100)}...</p>` : ""}
            </a>
        `;

        resultsDiv.appendChild(div);
    });
}
// ========== TIME-BASED FILTERING ==========
let currentMeals = [];

// Function to estimate cooking time
function estimateTime(meal) {
    const text = (meal.strMeal + ' ' + (meal.strInstructions || '')).toLowerCase();
    if (text.includes('salad') || text.includes('quick') || text.includes('fast') || text.includes('easy')) return 20;
    if (text.includes('bake') || text.includes('roast') || text.includes('grill') || text.includes('pasta')) return 45;
    if (text.includes('stew') || text.includes('slow') || text.includes('braise') || text.includes('simmer')) return 90;
    return 45;
}

// Function to filter meals by time
function filterMealsByTime(meals, timeValue) {
    if (!timeValue) return meals;
    
    return meals.filter(meal => {
        const time = estimateTime(meal);
        if (timeValue === 'quick') return time <= 30;
        if (timeValue === 'medium') return time > 30 && time <= 60;
        if (timeValue === 'long') return time > 60;
        return true;
    });
}

// Add time filter to search area
function addTimeFilter() {
    if (document.getElementById('timeFilter')) return;
    
    const timeFilter = document.createElement('select');
    timeFilter.id = 'timeFilter';
    timeFilter.innerHTML = `
        <option value="">All Times</option>
        <option value="quick">Quick (≤30 min)</option>
        <option value="medium">Medium (31-60 min)</option>
        <option value="long">Long (>60 min)</option>
    `;
    document.querySelector('.search-area').appendChild(timeFilter);
    
    timeFilter.addEventListener('change', function() {
        applyFilters();
    });
}

// Apply both category and time filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const timeValue = document.getElementById('timeFilter').value;
    
    if (category === "") {
        // No category filter, show all recipes with time filter
        fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
            .then(res => res.json())
            .then(data => {
                if (!data.meals) return;
                const filteredByTime = filterMealsByTime(data.meals, timeValue);
                currentMeals = filteredByTime;
                displayMeals(filteredByTime);
            });
    } else {
        // Apply category filter first, then time filter
        resultsDiv.innerHTML = "<p>Loading " + category + " recipes...</p>";
        
        fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=" + category)
            .then(res => res.json())
            .then(data => {
                if (!data.meals) {
                    resultsDiv.innerHTML = "<p>No recipes found.</p>";
                    return;
                }
                
                // Get full details for each meal
                const mealPromises = data.meals.slice(0, 10).map(meal => 
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                        .then(res => res.json())
                        .then(detailData => detailData.meals[0])
                );
                
                Promise.all(mealPromises)
                    .then(fullMeals => {
                        const validMeals = fullMeals.filter(meal => meal !== null);
                        const filteredByTime = filterMealsByTime(validMeals, timeValue);
                        currentMeals = filteredByTime;
                        displayMeals(filteredByTime, true);
                    })
                    .catch(() => {
                        const filteredByTime = filterMealsByTime(data.meals, timeValue);
                        currentMeals = filteredByTime;
                        displayMeals(filteredByTime, false);
                    });
            });
    }
}

// Category filter
document.getElementById("categoryFilter").addEventListener("change", function() {
    applyFilters();
});

// Load all recipes on page load
window.addEventListener("load", function () {
    resultsDiv.innerHTML = "<p>Loading all recipes...</p>";
    addTimeFilter();
    
    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                resultsDiv.innerHTML = "<p>No recipes found.</p>";
                return;
            }
            currentMeals = data.meals;
            displayMeals(data.meals);
        })
        .catch(() => {
           resultsDiv.innerHTML = `
  <div class="error-overlay">
    <div class="error-card">
      <h3>⚠ Unable to load recipes</h3>
      <p>Something went wrong while fetching recipes.</p>
      <p>Please check your connection and try again.</p>
      <button id="retryBtn">Retry</button>
    </div>
  </div>
`;

document.getElementById("retryBtn").addEventListener("click", () => {
    window.location.reload();
});
        });
});