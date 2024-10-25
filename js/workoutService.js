const API_URL = 'https://wger.de/api/v2/exercise/';
const exercises = {
    "running": { id: 1, met: 8.0 },
    "jumping": { id: 2, met: 7.5 },
    "walking": { id: 3, met: 3.5 },
    "cycling": { id: 4, met: 6.0 },
    "abdominales": { id: 5, met: 6.0 }
};

let totalCalories = 0;

async function getCaloriesPerMinute(exerciseId) {
    try {
        const response = await fetch(`${API_URL}${exerciseId}/`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        // Retornar el valor MET de la respuesta
        return data.results[0].met; // Ajusta según la estructura de la respuesta
    } catch (error) {
        console.error('Error fetching exercise data:', error);
        return 5; // Valor por defecto
    }
}

async function logWorkout(exerciseName, duration) {
    const exercise = exercises[exerciseName];
    if (!exercise) {
        console.error('Exercise not found');
        return;
    }

    const caloriesPerMinute = await getCaloriesPerMinute(exercise.id);
    const caloriesBurned = caloriesPerMinute * duration; // Calcular calorías
    updateTotalCalories(caloriesBurned); // Actualizar total
}

function updateTotalCalories(calories) {
    totalCalories += calories;
    document.getElementById('totalCalories').innerText = `Total Calories Burned: ${totalCalories}`;
}

// Ejemplo de uso
const exerciseName = "abdominales"; // Cambia según la entrada del usuario
const duration = 30; // minutos
logWorkout(exerciseName, duration);
