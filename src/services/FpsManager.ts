export class FpsManager {
  fps = 0;

  averageFPS = 0;

  #history: number[] = [];

  constructor() {
    const times: number[] = [];

    const refreshLoop = () => {
      const now = performance.now();

      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }

      times.push(now);
      this.fps = times.length;
      this.#history.push(this.fps);

      if (this.#history.length === 11) {
        this.#history.shift();
      }

      let sum = 0;

      for (let i = 0; i < this.#history.length; i += 1) {
        sum += this.#history[i];
      }

      this.averageFPS = Math.floor(sum / 10);
      console.log('average FPS: ', this.averageFPS);

      window.requestAnimationFrame(refreshLoop);
    };

    refreshLoop();
  }
}
