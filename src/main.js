import './style.css'

// Portfolio opening animation
// Text scrolls for 5s, then white explosion from the period position
console.log('Portfolio loaded')

// Elements
const cursor = document.querySelector(".cursor");
const invertedLoader = document.getElementById("loader-inverted");

// Cursor radius (half of 80px width)
const CURSOR_RADIUS = 40;

let mouseX = -200;
let mouseY = -200;

if (cursor) {
  document.addEventListener("mousemove", (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;

    // Position the visible cursor ring
    cursor.style.top = (mouseY - CURSOR_RADIUS) + "px";
    cursor.style.left = (mouseX - CURSOR_RADIUS) + "px";

    // Clip the inverted loader layer to a circle at cursor position
    if (invertedLoader) {
      invertedLoader.style.clipPath = `circle(${CURSOR_RADIUS}px at ${mouseX}px ${mouseY}px)`;
    }
  });

  document.addEventListener("click", () => {
    cursor.classList.add("click");

    setTimeout(() => {
      cursor.classList.remove("click");
    }, 300);
  });

  // After loader disappears (9s), enable homepage interaction
  // Hide parent cursor — homepage iframe has its own custom cursor
  setTimeout(() => {
    const explosion = document.querySelector('.white-explosion');
    if (explosion) explosion.style.pointerEvents = 'auto';
    cursor.style.display= 'none';
  }, 9000);

  // Signal homepage iframe to start SVG animation when explosion reveals it
  setTimeout(() => {
    const frame = document.querySelector('.homepage-frame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage('start-svg', '*');
    }
  }, 7500);
}