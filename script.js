// ================= GLOBAL VARIABLES =================
let allMeals = [];
let currentMeals = [];
const resultsDiv = document.getElementById("results");

// ================= SEARCH BUTTON =================
document.getElementById("searchBtn").addEventListener("click", function () {

    const query = document.getElementById("searchBox").value.trim();

    if (!query) {
        resultsDiv.innerHTML = "<p>Please enter a recipe name.</p>";
        return;
    }

    resultsDiv.innerHTML = `<p>Searching recipes for <b>${query}</b>...</p>`;

    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + query)
        .then(res => res.json())
        .then(data => {

            if (!data.meals) {
                resultsDiv.innerHTML = "<p>No recipes found.</p>";
                return;
            }

            allMeals = data.meals;
            currentMeals = [...allMeals];

            populateFilters();
            applyFilters();
        })
        .catch(() => {
            resultsDiv.innerHTML = "<p>Something went wrong while fetching recipes.</p>";
        });
});


// ================= DISPLAY MEALS =================
function displayMeals(meals) {

    resultsDiv.innerHTML = "";

    if (meals.length === 0) {
        resultsDiv.innerHTML = "<p>No meals match your filters.</p>";
        return;
    }

    meals.forEach(meal => {

        const estTime = estimateTime(meal);
        const timeBadge =
            estTime <= 30 ? "⚡ Quick" :
            estTime <= 60 ? "⏱️ Medium" :
            "🕒 Long";

        resultsDiv.innerHTML += `
            <div class="meal-card">
                <img src="${meal.strMealThumb}" width="200">
                <h3>${meal.strMeal}</h3>
                <p>${meal.strCategory} | ${meal.strArea}</p>
                <p>${timeBadge} (${estTime} min)</p>
            </div>
        `;
    });
}


// ================= ESTIMATE TIME =================
function estimateTime(meal) {
    const text = (meal.strMeal + ' ' + (meal.strInstructions || '')).toLowerCase();

    if (text.includes('salad') || text.includes('quick') || text.includes('fast') || text.includes('easy'))
        return 20;

    if (text.includes('bake') || text.includes('roast') || text.includes('grill') || text.includes('pasta'))
        return 45;

    if (text.includes('stew') || text.includes('slow') || text.includes('braise') || text.includes('simmer'))
        return 90;

    return 45;
}


// ================= TIME FILTER =================
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


// ================= POPULATE CATEGORY & AREA =================
function populateFilters() {

    const categorySet = new Set();
    const areaSet = new Set();

    allMeals.forEach(meal => {
        if (meal.strCategory) categorySet.add(meal.strCategory);
        if (meal.strArea) areaSet.add(meal.strArea);
    });

    const categoryFilter = document.getElementById("categoryFilter");
    const areaFilter = document.getElementById("areaFilter");

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    areaFilter.innerHTML = '<option value="all">All Areas</option>';

    categorySet.forEach(cat => {
        categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    areaSet.forEach(area => {
        areaFilter.innerHTML += `<option value="${area}">${area}</option>`;
    });
}


// ================= APPLY ALL FILTERS =================
function applyFilters() {

    const category = document.getElementById("categoryFilter")?.value || "all";
    const area = document.getElementById("areaFilter")?.value || "all";
    const timeValue = document.getElementById("timeFilter")?.value || "";

    let filtered = [...allMeals];

    if (category !== "all") {
        filtered = filtered.filter(meal => meal.strCategory === category);
    }

    if (area !== "all") {
        filtered = filtered.filter(meal => meal.strArea === area);
    }

    if (timeValue) {
        filtered = filterMealsByTime(filtered, timeValue);
    }

    currentMeals = filtered;
    displayMeals(filtered);
}


// ================= FILTER LISTENERS =================
document.getElementById("categoryFilter").addEventListener("change", applyFilters);
document.getElementById("areaFilter").addEventListener("change", applyFilters);
document.getElementById("timeFilter").addEventListener("change", applyFilters);


// ================= CLEAR BUTTON =================
document.getElementById("clearBtn").addEventListener("click", function () {

    document.getElementById("searchBox").value = "";
    document.getElementById("categoryFilter").value = "all";
    document.getElementById("areaFilter").value = "all";
    document.getElementById("timeFilter").value = "";

    resultsDiv.innerHTML = "";
});