interface ComputedResult {
	max: number;
	min: number;
	median: number;
	mean: number;
	stdDev: number;
	p70: number;
	p95: number;
	p99: number;
}

export interface BenchResultsType extends ComputedResult {
	startTime: number;
	endTime: number;
	runTime: number;
	sampleCount: number;
	samples: Array<Sample>;
	layout?: ComputedResult;
}

export interface Sample {
	start: number;
	end: number;
	elapsed: number;
	layout: number;
}

export type BenchmarkRef = { start: () => void };
export type BenchmarkType = 'mount' | 'update' | 'unmount';
