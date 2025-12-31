export interface Point {
  x: number;
  y: number;
}

export interface ParticleTarget extends Point {
  alpha?: number;
}

export enum ParticleState {
  ROCKET = 'ROCKET', // The initial rising firework
  EXPLODE = 'EXPLODE', // The initial burst before organizing
  MORPH = 'MORPH', // Moving towards text coordinates
  HOVER = 'HOVER', // Maintaining text shape with jitter
  FALL = 'FALL', // Dying and falling
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  hue: number;
  alpha: number;
  size: number;
  state: ParticleState;
  timer: number; // For tracking state duration
  shimmer: boolean;
}

export interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  targetText: string;
  exploded: boolean;
}
