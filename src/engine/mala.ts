export const BEADS_PER_MALA = 108;

export interface MalaState {
  total: number;
  beads: number;
  cycles: number;
}

export function toMalaState(total: number): MalaState {
  const safe = Math.max(0, Math.floor(Number(total) || 0));
  return {
    total: safe,
    beads: safe % BEADS_PER_MALA,
    cycles: Math.floor(safe / BEADS_PER_MALA),
  };
}

export function advanceMala(state: MalaState, step = 1): MalaState {
  return toMalaState(state.total + Math.max(1, Math.floor(step)));
}
