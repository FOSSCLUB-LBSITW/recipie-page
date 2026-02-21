document.getElementById("searchBtn").addEventListener("click", function() {
    let query = document.getElementById("searchBox").value;
    let resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "<p>Searching recipes for <b>" + query + "</b>...</p>";

    // FIX 1: Correct API URL
    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + query)
    .then(res => res.json())
    .then(data => {

        // FIX 2: Correct property name
        let meals = data.meals;

        if (!meals) {
            resultsDiv.innerHTML = "<p>No recipes found. Try again!</p>";
            return;
        }

        resultsDiv.innerHTML = "";

        meals.forEach(meal => {

            // FIX 3: Correct key name
            let div = document.createElement("div");
            div.classList.add("recipe");

            div.innerHTML = `
                <h3>${meal.strMeal}</h3>
                <img src="${meal.strMealThumb}" width="200">
                <p>${meal.strInstructions.substring(0, 100)}...</p>
            `;

            resultsDiv.appendChild(div);
        });
    })
    .catch(err => {
        console.error(err);
        resultsDiv.innerHTML = "<p>Error loading recipes!</p>";
    });
});