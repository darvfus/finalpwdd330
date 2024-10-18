const API_URL = 'https://wger.de/api/v2/exercise/';
let chart; // Store the chart instance
let caloriesData = {  // Store total calories by body part
    8: 0, // Arms
    9: 0, // Legs
    10: 0, // Chest
    12: 0, // Back
    6: 0 // Abs
};

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const bodyPartSelect = document.getElementById('exercise-category');
    const difficultySelect = document.getElementById('exercise-level');
    const getExercisesBtn = document.getElementById('getExercises');
    const exerciseListDiv = document.getElementById('exercise-list');
    const calculateCaloriesBtn = document.getElementById('calculateCalories');
    const exerciseSummaryDiv = document.getElementById('exerciseSummary'); // Where we display selected exercises

    const bodyPartCategories = {
        arms: 8,
        legs: 9,
        chest: 10,
        back: 12,
        abs: 6
    };

    const calorieData = {
        beginner: 100,
        intermediate: 200,
        advanced: 300
    };

    // Define different colors for each body part
    const barColors = {
        8: 'rgba(255, 99, 132, 0.6)',   // Arms
        9: 'rgba(54, 162, 235, 0.6)',   // Legs
        10: 'rgba(255, 206, 86, 0.6)',  // Chest
        12: 'rgba(75, 192, 192, 0.6)',  // Back
        6: 'rgba(153, 102, 255, 0.6)'   // Abs
    };

    // Fetch exercises when "Get Exercises" is clicked
    getExercisesBtn.addEventListener('click', () => {
        const selectedBodyPart = bodyPartSelect.value;
        const selectedDifficulty = difficultySelect.value;
        const categoryId = bodyPartCategories[selectedBodyPart];
        fetchExercisesByCategory(categoryId, selectedDifficulty);
    });

    // Fetch exercises by category and difficulty
    async function fetchExercisesByCategory(categoryId, difficulty) {
        try {
            const response = await fetch(`${API_URL}?category=${categoryId}&language=2`);
            const data = await response.json();

            // Filter exercises by category
            const filteredExercises = data.results.filter(exercise => exercise.category === categoryId);

            // Limit exercises based on difficulty
            let exerciseLimit = 6; // Default for beginner
            if (difficulty === 'intermediate') {
                exerciseLimit = 10;
            } else if (difficulty === 'advanced') {
                exerciseLimit = 12;
            }

            const limitedExercises = filteredExercises.slice(0, exerciseLimit);

            displayExercises(limitedExercises, difficulty);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    }

    // Display exercises with checkboxes
    function displayExercises(exercises, difficulty) {
        exerciseListDiv.innerHTML = ''; // Clear previous exercises

        if (exercises.length === 0) {
            exerciseListDiv.innerText = 'No exercises found for this body part and level.';
            return;
        }

        exercises.forEach(exercise => {
            const exerciseDiv = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = exercise.name;
            checkbox.dataset.calories = calorieData[difficulty]; // Store calories per exercise
            checkbox.dataset.bodyPart = exercise.category; // Store body part ID

            exerciseDiv.innerText = exercise.name;
            exerciseDiv.prepend(checkbox);

            exerciseListDiv.appendChild(exerciseDiv);
        });
    }

    // Handle calculate calories button
    calculateCaloriesBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('#exercise-list input:checked');
        resetCaloriesData(); // Reset the calorie data before calculating new totals

        selectedCheckboxes.forEach(cb => {
            const calories = parseInt(cb.dataset.calories);
            const bodyPartId = cb.dataset.bodyPart;
            caloriesData[bodyPartId] += calories; // Aggregate calories by body part
        });

        updateCaloriesChart(); // Update the chart with the new data
    });

    // Reset calorie data
    function resetCaloriesData() {
        caloriesData = {
            8: 0,
            9: 0,
            10: 0,
            12: 0,
            6: 0
        };
    }

    // Create or update the calories chart
    function updateCaloriesChart() {
        const labels = Object.keys(caloriesData).map(id => {
            switch (id) {
                case '8': return 'Arms';
                case '9': return 'Legs';
                case '10': return 'Chest';
                case '12': return 'Back';
                case '6': return 'Abs';
                default: return '';
            }
        });

        const data = {
            labels: labels,
            datasets: [{
                label: 'Calories Burned',
                data: Object.values(caloriesData),
                backgroundColor: labels.map(label => barColors[bodyPartCategories[label.toLowerCase()]])
            }]
        };

        if (chart) {
            chart.destroy(); // Destroy the old chart if it exists
        }

        const ctx = document.createElement('canvas');
        ctx.classList.add('caloriesChart'); // Add class for styling
        exerciseSummaryDiv.innerHTML = ''; // Clear previous charts
        exerciseSummaryDiv.appendChild(ctx); // Append new chart canvas to the summary div

        chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Calories'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Body Parts'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const bodyPart = context.label;
                                const calories = context.raw;
                                return `${bodyPart}: ${calories} calories`;
                            }
                        }
                    }
                }
            }
        });
    }
});
