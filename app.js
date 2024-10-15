const API_URL = 'https://wger.de/api/v2/exercise/'; // Asegúrate de que no haya duplicados
const exercises = {
    "running": { id: 1, met: 8.0 },
    "jumping": { id: 2, met: 7.5 },
    "walking": { id: 3, met: 3.5 },
    "cycling": { id: 4, met: 6.0 },
    "abdominales": { id: 5, met: 6.0 }
};

let totalCalories = 0;
let totalDistance = 0;
const workoutData = {}; // Almacena datos de calorías, distancia y ejercicios por día
const ctx = document.getElementById('caloriesChart').getContext('2d');

const caloriesChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [], // Días de la semana
        datasets: [{
            label: 'Calories Burned',
            data: [], // Calorías quemadas por día
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

// Función para registrar el entrenamiento y calcular las calorías quemadas
async function logWorkout(exerciseName, duration, day, distance = null) {
    const exercise = exercises[exerciseName];
    if (!exercise) {
        console.error('Exercise not found');
        return;
    }

    // Obtener valor de MET de la API o usar uno predefinido
    const caloriesPerMinute = await getCaloriesPerMinute(exercise.id) || exercise.met;
    const caloriesBurned = caloriesPerMinute * duration; // Calcular calorías
    updateTotalCalories(caloriesBurned); // Actualizar total de calorías

    // Guardar calorías, distancia y ejercicio en workoutData por día
    if (!workoutData[day]) {
        workoutData[day] = { calories: 0, exercise: exerciseName, distance: 0, date: new Date().toLocaleDateString() };
    }
    workoutData[day].calories += caloriesBurned;
    if (distance) {
        workoutData[day].distance += distance;
        totalDistance += distance; // Actualizar distancia total
    }

    // Calcular la velocidad si el ejercicio es de tipo que involucra distancia
    if (distance && (exerciseName === 'running' || exerciseName === 'walking' || exerciseName === 'cycling')) {
        const speed = calculateSpeed(distance, duration);
        const speedPerKm = calculateSpeedPerKm(distance, duration);
        document.getElementById('calculatedSpeed').innerText = `Speed: ${speed.toFixed(2)} km/h`; // Mostrar velocidad en km/h
        document.getElementById('speedPerKm').innerText = `Speed per km: ${speedPerKm.toFixed(2)} min/km`; // Mostrar velocidad por km
    } else {
        document.getElementById('calculatedSpeed').innerText = 'Speed: N/A'; // No aplica
        document.getElementById('speedPerKm').innerText = 'Speed per km: N/A'; // No aplica
    }

    // Actualizar el gráfico
    updateChart();

    // Mostrar resumen del ejercicio
    updateWorkoutSummary();

    // Mostrar resumen semanal
    updateWeeklySummary();
}

// Función para calcular la velocidad (distancia/tiempo)
function calculateSpeed(distance, duration) {
    return distance / (duration / 60); // km/h
}

// Función para calcular la velocidad por kilómetro (min/km)
function calculateSpeedPerKm(distance, duration) {
    return (duration / distance); // min/km
}

// Obtener valor de MET desde la API para un ejercicio dado
async function getCaloriesPerMinute(exerciseId) {
    try {
        const response = await fetch(`${API_URL}${exerciseId}/`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.met; // Ajusta esto si la estructura es diferente en la respuesta de la API
    } catch (error) {
        console.error('Error fetching exercise data:', error);
        return null;
    }
}

// Actualizar la visualización de calorías totales
function updateTotalCalories(calories) {
    totalCalories += calories;
    document.getElementById('totalCalories').innerText = `Total Calories Burned: ${totalCalories}`;
}

// Actualizar el gráfico con los datos más recientes
function updateChart() {
    caloriesChart.data.labels = Object.keys(workoutData).map(day => `${day} - ${workoutData[day].exercise}`); // Etiqueta con ejercicio
    caloriesChart.data.datasets[0].data = Object.values(workoutData).map(data => data.calories); // Datos de calorías
    caloriesChart.update();
}

// Actualizar el resumen de ejercicios
function updateWorkoutSummary() {
    const summaryDiv = document.getElementById('workoutSummary');
    summaryDiv.innerHTML = ''; // Limpiar el contenido previo

    for (const day in workoutData) {
        const workout = workoutData[day];
        const summary = document.createElement('div');
        summary.innerText = `On ${day} (${workout.date}), you did ${workout.exercise}, burned ${workout.calories.toFixed(2)} calories, and covered ${workout.distance.toFixed(2)} km.`;
        summaryDiv.appendChild(summary);
    }
}

// Actualizar el resumen semanal
function updateWeeklySummary() {
    const weeklySummaryDiv = document.getElementById('weeklySummary');
    weeklySummaryDiv.innerHTML = `Total calories burned this week: ${totalCalories.toFixed(2)}. Total distance covered: ${totalDistance.toFixed(2)} km.`;
}

// Escucha de eventos para registrar el entrenamiento
document.getElementById('logWorkout').addEventListener('click', () => {
    const exerciseName = document.getElementById('exercise').value;
    const duration = parseInt(document.getElementById('duration').value);
    const distance = parseFloat(document.getElementById('distance').value) || null;
    const day = document.getElementById('day').value;
    logWorkout(exerciseName, duration, day, distance);
});

// Desactivar el campo de distancia si es necesario
document.getElementById('exercise').addEventListener('change', (e) => {
    const selectedExercise = e.target.value;
    const distanceInput = document.getElementById('distance');
    if (selectedExercise === 'jumping' || selectedExercise === 'abdominales') {
        distanceInput.disabled = true;
    } else {
        distanceInput.disabled = false;
    }
});

// Agrega esta función para enviar el resumen semanal por correo
function sendWeeklySummaryEmail() {
    const userEmail = document.getElementById('userEmail').value; // Obtén el correo del usuario
    if (!userEmail) {
        alert("Please enter a valid email address.");
        return;
    }

    const message = `Hello! Here's your fitness progress for the week:\n
    Total Calories Burned: ${totalCalories.toFixed(2)}\n
    Total Distance Covered: ${totalDistance.toFixed(2)} km\n
    Keep up the good work! You're doing amazing!`;

    const emailParams = {
        to_name: "User", // Puedes personalizar el nombre del usuario
        to_email: userEmail, // Usa el correo del usuario
        message: message,
        subject: "Your Weekly Fitness Summary"
    };

    emailjs.send("service_9fdojkb", "template_8aueuvr", emailParams)
    .then(function(response) {
        console.log('Email sent successfully!', response.status, response.text);
        alert("Weekly summary sent to your email!");
    }, function(error) {
        console.error('Failed to send email:', error);
        alert("There was an error sending the email.");
    });
}

// Escuchar evento para enviar resumen semanal por correo
document.getElementById('sendWeeklySummary').addEventListener('click', sendWeeklySummaryEmail);
