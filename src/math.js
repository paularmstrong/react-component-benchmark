type Values = Array<number>;

export const getStdDev = (values: Values): number => {
  const avg = getMean(values);

  const squareDiffs = values.map(value => {
    const diff = value - avg;
    return diff * diff;
  });

  return Math.sqrt(getMean(squareDiffs));
};

export const getMean = (values: Values): number => {
  const sum = values.reduce((sum, value) => sum + value, 0);
  return sum / values.length;
};

export const getMedian = (values: Values): number => {
  if (values.length === 1) {
    return values[0];
  }

  const numbers = values.sort((a, b) => a - b);
  return (numbers[(numbers.length - 1) >> 1] + numbers[numbers.length >> 1]) / 2;
};
