// @flow
import * as Timing from './timing';
import BenchmarkType from './BenchmarkType';
import React, { Component } from 'react';
import { getMean, getMedian, getStdDev } from './math';

import type { BenchResultsType, FullSampleTimingType, SampleTimingType } from './types';

const styles = {
  content: {
    position: 'absolute',
    left: '-999em'
  }
};

const emptyObject = {};

const shouldRender = (cycle: number, type: $Values<typeof BenchmarkType>): boolean => {
  switch (type) {
    // Render every odd iteration (first, third, etc)
    // Mounts and unmounts the component
    case BenchmarkType.MOUNT:
    case BenchmarkType.UNMOUNT:
      return !((cycle + 1) % 2);
    // Render every iteration (updates previously rendered module)
    case BenchmarkType.UPDATE:
      return true;
    default:
      return false;
  }
};

const shouldRecord = (cycle: number, type: $Values<typeof BenchmarkType>): boolean => {
  switch (type) {
    // Record every odd iteration (when mounted: first, third, etc)
    case BenchmarkType.MOUNT:
      return !((cycle + 1) % 2);
    // Record every iteration
    case BenchmarkType.UPDATE:
      return true;
    // Record every even iteration (when unmounted)
    case BenchmarkType.UNMOUNT:
      return !(cycle % 2);
    default:
      return false;
  }
};

const isDone = (cycle: number, samples: number, type: $Values<typeof BenchmarkType>): boolean => {
  switch (type) {
    case BenchmarkType.MOUNT:
      return cycle >= samples * 2 - 1;
    case BenchmarkType.UPDATE:
      return cycle >= samples - 1;
    case BenchmarkType.UNMOUNT:
      return cycle >= samples * 2;
    default:
      return true;
  }
};

const sortNumbers = (a: number, b: number): number => a - b;

type BenchmarkPropsType = {
  component: typeof React.Component,
  componentProps?: {},
  onComplete: (x: BenchResultsType) => void,
  samples: number,
  timeout: number,
  type: $Values<typeof BenchmarkType>
};

type BenchmarkStateType = {
  componentProps: {},
  cycle: number,
  running: boolean
};

/**
 * Benchmark
 * TODO: documentation
 */
export default class Benchmark extends Component<BenchmarkPropsType, BenchmarkStateType> {
  _startTime: number;
  _samples: Array<SampleTimingType>;

  static defaultProps = {
    componentProps: emptyObject,
    samples: 50,
    timeout: 10000, // 10 seconds
    type: BenchmarkType.MOUNT
  };

  static Type = BenchmarkType;

  constructor(props: BenchmarkPropsType, context?: {}) {
    super(props, context);
    this.state = {
      componentProps: props.componentProps || emptyObject,
      cycle: 0,
      running: false
    };
    this._startTime = 0;
    this._samples = [];
  }

  componentWillReceiveProps(nextProps: BenchmarkPropsType) {
    this.setState({ componentProps: nextProps.componentProps });
  }

  componentWillUpdate(nextProps: BenchmarkPropsType, nextState: BenchmarkStateType) {
    const { type } = nextProps;
    const { cycle, running } = nextState;
    if (running) {
      const now = Timing.now();
      if (!this.state.running) {
        this._startTime = now;
      }
      if (shouldRecord(cycle, type)) {
        this._samples[cycle] = { start: now };
      }
    }
  }

  componentDidUpdate() {
    const { samples, timeout, type } = this.props;
    const { cycle, running } = this.state;

    if (running && shouldRecord(cycle, type)) {
      this._samples[cycle].end = Timing.now();
    }

    if (running) {
      const now = Timing.now();
      if (!isDone(cycle, samples, type) && now - this._startTime < timeout) {
        this._handleCycleComplete();
      } else {
        this._handleComplete(now);
      }
    }
  }

  render() {
    const { component: Component, type } = this.props;
    const { componentProps, cycle, running } = this.state;
    return running && shouldRender(cycle, type) ? (
      <div style={styles.content}>
        <Component {...componentProps} />
      </div>
    ) : null;
  }

  start() {
    this._samples = [];
    this.setState({ running: true, cycle: 0 });
  }

  _handleCycleComplete() {
    const { componentProps, type } = this.props;
    const { cycle } = this.state;

    // Calculate the component props outside of the time recording (render)
    // so that it doesn't skew results
    const nextProps = type === BenchmarkType.UPDATE ? { ...componentProps, 'data-test': cycle } : componentProps;

    this.setState((state: BenchmarkStateType) => ({ componentProps: nextProps, cycle: state.cycle + 1 }));
  }

  getSamples(): Array<FullSampleTimingType> {
    return this._samples.reduce((memo: Array<FullSampleTimingType>, { start, end: endTime }: SampleTimingType): Array<
      FullSampleTimingType
    > => {
      const end = endTime || 0;
      memo.push({ start, end, elapsed: end - start });
      return memo;
    }, []);
  }

  _handleComplete(endTime: number) {
    const { onComplete } = this.props;
    const samples = this.getSamples();

    this.setState({ running: false, cycle: 0 });

    const runTime = endTime - this._startTime;
    const sortedElapsedTimes = samples.map(({ elapsed }: { elapsed: number }): number => elapsed).sort(sortNumbers);
    const mean = getMean(sortedElapsedTimes);
    const stdDev = getStdDev(sortedElapsedTimes);

    onComplete({
      startTime: this._startTime,
      endTime,
      runTime,
      sampleCount: samples.length,
      samples: samples,
      max: sortedElapsedTimes[sortedElapsedTimes.length - 1],
      min: sortedElapsedTimes[0],
      median: getMedian(sortedElapsedTimes),
      mean,
      stdDev,
      p70: mean + stdDev,
      p95: mean + stdDev * 2,
      p99: mean + stdDev * 3
    });
  }
}
