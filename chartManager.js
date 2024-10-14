import Chart from 'chart.js/auto';

let chart;

export function loadChart() {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const ctx = document.getElementById('progressChart').getContext('2d');

    const labels = workouts.map(workout => workout.type);
    const data = workouts.map(workout => workout.calories);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories Burned',
                data: data,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true
        }
    });
}
