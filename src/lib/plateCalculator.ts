export interface PlateCalculation {
  totalWeight: number;
  barWeight: number;
  perSideWeight: number;
  platesPerSide: { weight: number; count: number; color: string }[];
  remainder: number;
}

const STANDARD_PLATES_KG = [
  { weight: 25, color: '#E8505B' }, // Red
  { weight: 20, color: '#0A84FF' }, // Blue
  { weight: 15, color: '#FECA57' }, // Yellow
  { weight: 10, color: '#34C759' }, // Green
  { weight: 5, color: '#FFFFFF' },  // White
  { weight: 2.5, color: '#8E8E93' }, // Silver/Grey
  { weight: 1.25, color: '#636366' }, // Dark Grey
];

export function calculatePlates(
  totalWeightKg: number,
  barWeightKg: number = 20
): PlateCalculation {
  const bar = Math.max(0, barWeightKg);
  const total = Math.max(bar, totalWeightKg);
  const targetPerSide = (total - bar) / 2;

  let remaining = targetPerSide;
  const platesPerSide: { weight: number; count: number; color: string }[] = [];

  for (const plate of STANDARD_PLATES_KG) {
    if (remaining >= plate.weight) {
      const count = Math.floor(remaining / plate.weight);
      if (count > 0) {
        platesPerSide.push({
          weight: plate.weight,
          count,
          color: plate.color,
        });
        remaining = Math.round((remaining - count * plate.weight) * 100) / 100;
      }
    }
  }

  return {
    totalWeight: total,
    barWeight: bar,
    perSideWeight: targetPerSide,
    platesPerSide,
    remainder: remaining,
  };
}
