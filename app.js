import { loadChart } from './chartManager.js';
import { logWorkout, loadWorkouts } from './workoutLog.js';
import { fetchWorkouts } from './workoutService.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('workout-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const workoutType = document.getElementById('workout-type').value;
        const duration = document.getElementById('duration').value;
        const calories = document.getElementById('calories').value;
        logWorkout(workoutType, duration, calories);
        loadChart();
        form.reset();
    });

    // Load workouts from external JSON and local storage
    fetchWorkouts();
    loadWorkouts();
    loadChart();
});
