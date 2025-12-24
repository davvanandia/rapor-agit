export const calculateAverage = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Number((sum / scores.length).toFixed(2));
};

export const calculateTotalScore = (scores: number[]): number => {
  return scores.reduce((a, b) => a + b, 0);
};

export const formatNumber = (num: number): string => {
  return num.toFixed(2).replace('.', ',');
};