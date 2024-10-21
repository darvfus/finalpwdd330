const carouselSlide = document.querySelector('.carousel-slide');
const images = document.querySelectorAll('.carousel-slide img');

let counter = 0;
const size = images[0].clientWidth;

document.getElementById('nextBtn').addEventListener('click', () => {
    if (counter >= images.length - 1) return;
    carouselSlide.style.transform = 'translateX(' + (-size * (++counter)) + 'px)';
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (counter <= 0) return;
    carouselSlide.style.transform = 'translateX(' + (-size * (--counter)) + 'px)';
});
