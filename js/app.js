const API_URL = 'https://wger.de/api/v2/exercise/';
const exercises = {
    "running": { id: 1, met: 8.0 },
    "jumping": { id: 2, met: 7.5 },
    "walking": { id: 3, met: 3.5 },
    "cycling": { id: 4, met: 6.0 },
    "abdominales": { id: 5, met: 6.0 }
};

let totalCalories = loadTotalCalories();
let totalDistance = loadTotalDistance();
const workoutData = loadWorkoutData() || {};
const ctx = document.getElementById('caloriesChart').getContext('2d');

const caloriesChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Calories Burned',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

async function logWorkout(exerciseName, duration, date, distance = null) {
    const exercise = exercises[exerciseName];
    if (!exercise) {
        console.error('Ejercicio no encontrado');
        return;
    }

    const caloriesPerMinute = await getCaloriesPerMinute(exercise.id) || exercise.met;
    const caloriesBurned = caloriesPerMinute * duration;
    updateTotalCalories(caloriesBurned);

    const formattedDate = new Date(date).toLocaleDateString(); // Formatear la fecha
    if (!workoutData[formattedDate]) {
        workoutData[formattedDate] = { calories: 0, exercise: exerciseName, distance: 0, date: formattedDate };
    }
    workoutData[formattedDate].calories += caloriesBurned;
    if (distance) {
        workoutData[formattedDate].distance += distance;
        totalDistance += distance;
    }

    if (distance && (exerciseName === 'running' || exerciseName === 'walking' || exerciseName === 'cycling')) {
        const speed = calculateSpeed(distance, duration);
        const speedPerKm = calculateSpeedPerKm(distance, duration);
        document.getElementById('calculatedSpeed').innerText = `Speed: ${speed.toFixed(2)} km/h`;
        document.getElementById('speedPerKm').innerText = `Speed per km: ${speedPerKm.toFixed(2)} min/km`;
    } else {
        document.getElementById('calculatedSpeed').innerText = 'Speed: N/A';
        document.getElementById('speedPerKm').innerText = 'Speed per km: N/A';
    }

    saveWorkoutData();  // Guardar en localStorage
    updateChart();
    updateWorkoutSummary();
    updateWeeklySummary();
}

function calculateSpeed(distance, duration) {
    return distance / (duration / 60);
}

function calculateSpeedPerKm(distance, duration) {
    return (duration / distance);
}

async function getCaloriesPerMinute(exerciseId) {
    try {
        const response = await fetch(`${API_URL}${exerciseId}/`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.met;
    } catch (error) {
        console.error('Error al obtener datos del ejercicio:', error);
        return null;
    }
}

function updateTotalCalories(calories) {
    totalCalories += calories;
    document.getElementById('totalCalories').innerText = `Total Calories Burned: ${totalCalories}`;
    saveTotalCalories();  // Guardar en localStorage
}

function updateChart() {
    caloriesChart.data.labels = Object.keys(workoutData).map(day => `${day} - ${workoutData[day].exercise}`);
    caloriesChart.data.datasets[0].data = Object.values(workoutData).map(data => data.calories);
    caloriesChart.update();
}

function updateWorkoutSummary() {
    const summaryDiv = document.getElementById('workoutSummary');
    summaryDiv.innerHTML = '';

    for (const day in workoutData) {
        const workout = workoutData[day];
        const summary = document.createElement('div');
        summary.innerText = `On ${day} (${workout.date}), you did ${workout.exercise}, burned ${workout.calories.toFixed(2)} calories, and covered ${workout.distance.toFixed(2)} km.`;
        summaryDiv.appendChild(summary);
    }
}

function updateWeeklySummary() {
    const weeklySummaryDiv = document.getElementById('weeklySummary');
    weeklySummaryDiv.innerHTML = `Total calories burned this week: ${totalCalories.toFixed(2)}. Total distance covered: ${totalDistance.toFixed(2)} km.`;
}

// Guardar y cargar datos desde localStorage
function loadWorkoutData() {
    const storedData = localStorage.getItem('workoutData');
    return storedData ? JSON.parse(storedData) : null;
}

function saveWorkoutData() {
    localStorage.setItem('workoutData', JSON.stringify(workoutData));
}

function loadTotalCalories() {
    return parseFloat(localStorage.getItem('totalCalories')) || 0;
}

function saveTotalCalories() {
    localStorage.setItem('totalCalories', totalCalories);
}

function loadTotalDistance() {
    return parseFloat(localStorage.getItem('totalDistance')) || 0;
}

function saveTotalDistance() {
    localStorage.setItem('totalDistance', totalDistance);
}

// Eventos para registrar entrenamientos
document.getElementById('logWorkout').addEventListener('click', () => {
    const exerciseName = document.getElementById('exercise').value;
    const duration = parseInt(document.getElementById('duration').value);
    const distance = parseFloat(document.getElementById('distance').value) || null;
    const date = document.getElementById('day').value; // Obtener la fecha del input de fecha

    // Validar que se ha seleccionado una fecha
    if (!date) {
        alert('The date has not been selected. Please select a date.');
        return;
    }

    logWorkout(exerciseName, duration, date, distance);
});

document.getElementById('exercise').addEventListener('change', (e) => {
    const selectedExercise = e.target.value;
    const distanceInput = document.getElementById('distance');
    if (selectedExercise === 'jumping' || selectedExercise === 'abdominales') {
        distanceInput.disabled = true;
    } else {
        distanceInput.disabled = false;
    }
});

// Cargar datos guardados al cargar la página
window.addEventListener('load', () => {
    updateChart();
    updateWorkoutSummary();
    updateWeeklySummary();
    document.getElementById('totalCalories').innerText = `Total Calories Burned: ${totalCalories}`;
});
// Event listener para el botón de Borrar Gráfica
document.getElementById('clearChart').addEventListener('click', clearChartData);

function clearChartData() {
    caloriesChart.data.labels = []; // Vaciar las etiquetas
    caloriesChart.data.datasets[0].data = []; // Vaciar los datos
    caloriesChart.update(); // Actualizar la gráfica para reflejar los cambios
}

