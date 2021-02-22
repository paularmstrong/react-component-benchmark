// @flow

type ComputedResult = {|
  max: number,
  min: number,
  median: number,
  mean: number,
  stdDev: number,
  p70: number,
  p95: number,
  p99: number,
|};

export type BenchResultsType = {|
  startTime: number,
  endTime: number,
  runTime: number,
  sampleCount: number,
  samples: Array<Sample>,
  ...ComputedResult,
  layout?: ComputedResult,
|};

export type Sample = {|
  start: number,
  end: number,
  elapsed: number,
  layout: number,
|};
