export async function fetchWorkouts() {
    try {
        const response = await fetch('./data.json');
        const data = await response.json();
        localStorage.setItem('workouts', JSON.stringify(data));
    } catch (error) {
        console.error('Error fetching workouts:', error);
    }
}
