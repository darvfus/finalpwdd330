const workoutLog = (() => {
    let workouts = [];

    const addWorkout = (exerciseId, duration, calories) => {
        workouts.push({ exerciseId, duration, calories });
    };

    const getTotalCalories = () => {
        return workouts.reduce((total, workout) => total + workout.calories, 0);
    };

    const getWorkoutData = () => {
        return workouts.map(workout => ({
            exerciseId: workout.exerciseId,
            duration: workout.duration,
            calories: workout.calories
        }));
    };

    return {
        addWorkout,
        getTotalCalories,
        getWorkoutData
    };
})();
