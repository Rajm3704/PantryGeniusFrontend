const API_BASE = 'https://pantrygeniusbackend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const ingredientList = document.getElementById('ingredient-list');
    const findRecipesBtn = document.getElementById('find-recipes-btn');
    const recipeResults = document.getElementById('recipe-results');
    const rightPanel = document.querySelector('.right-panel');

    // Add Recipe Form Elements
    const addRecipeForm = document.getElementById('add-recipe-form');
    const newRecipeName = document.getElementById('new-recipe-name');
    const newRecipeIngredients = document.getElementById('new-recipe-ingredients');
    const newRecipeInstructions = document.getElementById('new-recipe-instructions');

    // State
    let userIngredients = [];
    let allRecipes = []; 

    const fetchRecipes = async () => {
        try {
const response = await fetch(`${API_BASE}/api/recipes`);
            if (!response.ok) throw new Error('Network response was not ok');
            allRecipes = await response.json();
            renderRecipes(allRecipes); 
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
            recipeResults.innerHTML = '<p>Could not load recipes. Please try again later.</p>';
        }
    };

    const renderIngredients = () => {
        ingredientList.innerHTML = '';
        userIngredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.classList.add('tag');
            tag.textContent = ingredient;
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-tag');
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => {
                userIngredients = userIngredients.filter(item => item !== ingredient);
                renderIngredients();
            };
            tag.appendChild(removeBtn);
            ingredientList.appendChild(tag);
        });
    };
    
    const displayRecipeDetails = (recipe) => {
        rightPanel.innerHTML = ''; // Clear existing content
        rightPanel.classList.add('show-details'); // Switch to detail view styling

        const detailWrapper = document.createElement('div');
        detailWrapper.classList.add('recipe-detail-view');
        
        const recipeImage = document.createElement('div');
        recipeImage.classList.add('recipe-detail-image');
        recipeImage.style.backgroundImage = `url('${recipe.imageUrl || 'https://placehold.co/400x300/f8f8f8/ccc?text=No+Image'}')`;

        const recipeName = document.createElement('h2');
        recipeName.textContent = recipe.name;
        
        const ingredientsTitle = document.createElement('h4');
        ingredientsTitle.textContent = 'Ingredients';
        
        const ingredientsListEl = document.createElement('ul');
        ingredientsListEl.classList.add('detail-ingredients-list');
        recipe.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing;
            if(userIngredients.includes(ing.toLowerCase())) {
                li.classList.add('available');
            } else {
                li.classList.add('missing');
            }
            ingredientsListEl.appendChild(li);
        });

        const instructionsTitle = document.createElement('h4');
        instructionsTitle.textContent = 'Instructions';
        
        const instructionsListEl = document.createElement('ol');
        instructionsListEl.classList.add('detail-instructions-list');
        recipe.instructions.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            instructionsListEl.appendChild(li);
        });
        
        detailWrapper.appendChild(recipeImage);
        detailWrapper.appendChild(recipeName);
        detailWrapper.appendChild(ingredientsTitle);
        detailWrapper.appendChild(ingredientsListEl);
        detailWrapper.appendChild(instructionsTitle);
        detailWrapper.appendChild(instructionsListEl);
        
        rightPanel.appendChild(detailWrapper);
    };

    const renderRecipes = (recipes) => {
        recipeResults.innerHTML = '';
        if (recipes.length === 0) {
            recipeResults.innerHTML = '<p>No recipes found. Try different ingredients!</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.classList.add('recipe-card');

            const img = document.createElement('img');
            img.src = recipe.imageUrl || 'https://placehold.co/400x300/f8f8f8/ccc?text=No+Image';
            img.alt = recipe.name;
            img.classList.add('recipe-image');
            
            const content = document.createElement('div');
            content.classList.add('recipe-card-content');
            
            const name = document.createElement('h3');
            name.textContent = recipe.name;

            const availableCount = recipe.ingredients.filter(ing => userIngredients.includes(ing.toLowerCase())).length;
            const totalCount = recipe.ingredients.length;
            
            const availabilityText = document.createElement('p');
            availabilityText.classList.add('recipe-availability');
            availabilityText.innerHTML = `You have: <strong>${availableCount}/${totalCount}</strong>`;
            
            content.appendChild(name);
            content.appendChild(availabilityText);
            card.appendChild(img);
            card.appendChild(content);

            card.onclick = () => {
                displayRecipeDetails(recipe);
            };

            recipeResults.appendChild(card);
        });
    };

    const addIngredient = () => {
        const ingredient = ingredientInput.value.trim().toLowerCase();
        if (ingredient && !userIngredients.includes(ingredient)) {
            userIngredients.push(ingredient);
            renderIngredients();
            ingredientInput.value = '';
            ingredientInput.focus();
        }
    };

    const findRecipes = () => {
        if (userIngredients.length === 0) {
            renderRecipes(allRecipes);
            return;
        }

        const foundRecipes = allRecipes.filter(recipe => {
            return recipe.ingredients.some(ing => userIngredients.includes(ing.toLowerCase()));
        });
        
        foundRecipes.sort((a, b) => {
            const aMatches = a.ingredients.filter(ing => userIngredients.includes(ing.toLowerCase())).length;
            const bMatches = b.ingredients.filter(ing => userIngredients.includes(ing.toLowerCase())).length;
            return bMatches - aMatches;
        });

        renderRecipes(foundRecipes);
    };

    const handleAddRecipe = async (event) => {
        event.preventDefault();

        const name = newRecipeName.value.trim();
        const ingredients = newRecipeIngredients.value.split(',').map(item => item.trim().toLowerCase()).filter(item => item);
        const instructions = newRecipeInstructions.value.split('\n').map(item => item.trim()).filter(item => item);

        if (!name || ingredients.length === 0 || instructions.length === 0) {
            alert('Please fill out all recipe fields.');
            return;
        }

        const newRecipe = { name, ingredients, instructions };
        
        try {
            const response = await fetch(`${API_BASE}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRecipe),
});


            if (!response.ok) throw new Error('Failed to add recipe');

            const addedRecipe = await response.json();
            allRecipes.push(addedRecipe);
            addRecipeForm.reset();
            alert('Recipe added successfully!');
            findRecipes();

        } catch (error) {
            console.error('Error adding recipe:', error);
            alert('There was an error adding your recipe.');
        }
    };

    // --- Event Listeners ---
    addIngredientBtn.addEventListener('click', addIngredient);
    ingredientInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addIngredient();
    });
    findRecipesBtn.addEventListener('click', findRecipes);
    addRecipeForm.addEventListener('submit', handleAddRecipe);

    // Initial load
    fetchRecipes();
    feather.replace();
});

