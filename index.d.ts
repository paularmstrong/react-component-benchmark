import { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react';

export const BenchmarkType: {
    MOUNT: 'mount';
    UPDATE: 'update';
    UNMOUNT: 'unmount';
};

export interface Sample {
    start: number;
    end: number;
    elapsed: number;
    layout: number;
}

export interface ComputedResult {
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
    samples: Sample[];
    layout?: ComputedResult;
}

export interface BenchmarkProps {
    component: ComponentType<any>;
    componentProps?: any;
    includeLayout?: boolean;
    onComplete: (res: BenchResultsType) => void;
    samples: number;
    timeout?: number;
    type: typeof BenchmarkType[keyof typeof BenchmarkType];
}

export interface BenchmarkRef {
    start: () => void;
}

declare const Benchmark: ForwardRefExoticComponent<BenchmarkProps & RefAttributes<BenchmarkRef>>;

export default Benchmark;