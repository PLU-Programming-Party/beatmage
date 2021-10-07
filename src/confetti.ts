import confetti from "canvas-confetti";

export function rainConfetti(elementId: string): void {
  confetti.create(document.getElementById(elementId), {
    resize: true,
    useWorker: true,
  })({ particleCount: 200, spread: 200 });
}
