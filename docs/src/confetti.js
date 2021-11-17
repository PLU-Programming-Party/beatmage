import confetti from "../_snowpack/pkg/canvas-confetti.js";
export function rainConfetti(elementId) {
  confetti.create(document.getElementById(elementId), {
    resize: true,
    useWorker: true
  })({particleCount: 200, spread: 200});
}
