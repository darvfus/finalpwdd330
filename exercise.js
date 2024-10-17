const API_URL = 'https://wger.de/api/v2/exercise/';

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const bodyPartSelect = document.getElementById('exercise-category');
    const getExercisesBtn = document.getElementById('getExercises');
    const exerciseListDiv = document.getElementById('exercise-list');

    // Map of body parts to Wger API category IDs
    const bodyPartCategories = {
        arms: 8,      // Category ID for arms
        legs: 9,      // Category ID for legs
        chest: 10,    // Category ID for chest
        back: 12,     // Category ID for back
        abs: 6        // Category ID for abs
    };

    // Add event listener to the "Get Exercises" button
    getExercisesBtn.addEventListener('click', () => {
        const selectedBodyPart = bodyPartSelect.value;
        const categoryId = bodyPartCategories[selectedBodyPart];
        fetchExercisesByCategory(categoryId);
    });

    // Fetch exercises by category ID from the Wger API
    async function fetchExercisesByCategory(categoryId) {
        try {
            const response = await fetch(`${API_URL}?category=${categoryId}&language=2`); // language=2 for English
            const data = await response.json();

            displayExercises(data.results);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    }

    // Display the fetched exercises
    function displayExercises(exercises) {
        exerciseListDiv.innerHTML = ''; // Clear previous exercises

        if (exercises.length === 0) {
            exerciseListDiv.innerText = 'No exercises found for this body part.';
            return;
        }

        exercises.forEach(exercise => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.innerText = exercise.name;
            exerciseListDiv.appendChild(exerciseDiv);
        });
    }
});
