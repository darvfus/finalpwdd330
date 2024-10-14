export function logWorkout(type, duration, calories) {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const newWorkout = { type, duration, calories };
    workouts.push(newWorkout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

export function loadWorkouts() {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts.forEach(workout => console.log(workout));
}
