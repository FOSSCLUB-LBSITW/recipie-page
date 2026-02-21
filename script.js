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
        resultsDiv.innerHTML = "<p>Error loading recipes!</p>";
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
