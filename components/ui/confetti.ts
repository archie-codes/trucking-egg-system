import confetti from "canvas-confetti";

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 75,
      spread: 70,
      startVelocity: 32,
      scalar: 1.15, // Larger confetti particles
      origin: { y: 0.45, x: 0.5 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"],
      zIndex: 99999,
    });
  } catch (err) {
    console.error("Confetti error:", err);
  }
}
