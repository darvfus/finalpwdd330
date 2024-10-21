const API_URL = 'https://wger.de/api/v2/exercise/';
const exercises = {
    "running": { id: 1, met: 8.0 },
    "jumping": { id: 2, met: 7.5 },
    "walking": { id: 3, met: 3.5 },
    "cycling": { id: 4, met: 6.0 },
    "abdominales": { id: 5, met: 6.0 }
};

let totalCalories = 0;
let totalDistance = 0;
const workoutData = {};
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

async function logWorkout(exerciseName, duration, day, distance = null) {
    const exercise = exercises[exerciseName];
    if (!exercise) {
        console.error('Exercise not found');
        return;
    }

    const caloriesPerMinute = await getCaloriesPerMinute(exercise.id) || exercise.met;
    const caloriesBurned = caloriesPerMinute * duration;
    updateTotalCalories(caloriesBurned);

    if (!workoutData[day]) {
        workoutData[day] = { calories: 0, exercise: exerciseName, distance: 0, date: new Date().toLocaleDateString() };
    }
    workoutData[day].calories += caloriesBurned;
    if (distance) {
        workoutData[day].distance += distance;
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
        console.error('Error fetching exercise data:', error);
        return null;
    }
}

function updateTotalCalories(calories) {
    totalCalories += calories;
    document.getElementById('totalCalories').innerText = `Total Calories Burned: ${totalCalories}`;
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

document.getElementById('logWorkout').addEventListener('click', () => {
    const exerciseName = document.getElementById('exercise').value;
    const duration = parseInt(document.getElementById('duration').value);
    const distance = parseFloat(document.getElementById('distance').value) || null;
    const day = document.getElementById('day').value;
    logWorkout(exerciseName, duration, day, distance);
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




