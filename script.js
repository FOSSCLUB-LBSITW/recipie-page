document.getElementById("searchBtn").addEventListener("click", function() {
    let query = document.getElementById("searchBox").value;
    let resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "<p>Searching recipes for <b>" + query + "</b>...</p>";

    // BUG 1: Wrong API URL (typo in "themealdb")
    fetch("https://www.themeald.com/api/json/v1/1/search.php?s=" + query)
    .then(res => res.json())
    .then(data => {
        // BUG 2: Wrong property name (mealsData instead of meals)
        let meals = data.mealsData;

        if (!meals) {
            resultsDiv.innerHTML = "<p>No recipes found. Try again!</p>";
            return;
        }

        resultsDiv.innerHTML = "";
        meals.forEach(meal => {
            // BUG 3: Wrong key (meal.title instead of meal.strMeal)
            let div = document.createElement("div");
            div.classList.add("recipe");
            div.innerHTML = `<h3>${meal.title}</h3>
                             <p>${meal.strInstructions.substring(0, 100)}...</p>`;
            resultsDiv.appendChild(div);
        });
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
});

function displayMeals(meals, showInstructions = true) {
    resultsDiv.innerHTML = "";

    meals.forEach(meal => {
        let div = document.createElement("div");
        div.classList.add("recipe-card");

        div.innerHTML = `
            <a href="product-detail.html?name=${encodeURIComponent(meal.strMeal)}" class="recipe-link">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>${meal.strMeal}</h3>
                ${showInstructions ? `<p>${meal.strInstructions.substring(0, 100)}...</p>` : ""}
            </a>
        `;

        resultsDiv.appendChild(div);
    });
}

// Load all recipes on page load
window.addEventListener("load", function () {
    resultsDiv.innerHTML = "<p>Loading all recipes...</p>";

    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                resultsDiv.innerHTML = "<p>No recipes found.</p>";
                return;
            }
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

// Category filter
categoryFilter.addEventListener("change", function () {
    const category = this.value;

    if (category === "") {
        window.dispatchEvent(new Event("load")); // Reload all recipes
        return;
    }

    resultsDiv.innerHTML = "<p>Loading " + category + " recipes...</p>";

    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=" + category)
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                resultsDiv.innerHTML = "<p>No recipes found.</p>";
                return;
            }

            // Note: Filter API does not return instructions, so hide description
            displayMeals(data.meals, false);
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