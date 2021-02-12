// @flow
import * as React from 'react';
import * as Timing from './timing';
import BenchmarkType from './BenchmarkType';
import { getMean, getMedian, getStdDev } from './math';
import type { BenchResultsType, FullSampleTimingType } from './types';

const styles = {
  content: {
    position: 'absolute',
    left: '-999em',
  },
};

const sortNumbers = (a: number, b: number): number => a - b;

type Props = {|
  component: React.AbstractComponent<*>,
  componentProps?: {},
  onComplete: (x: BenchResultsType) => void,
  samples: number,
  timeout?: number,
  type?: $Values<typeof BenchmarkType>,
|};

type State = {|
  running: boolean,
  startTime: number,
  cycle: number,
  samples: Array<FullSampleTimingType>,
|};

const initialState: State = {
  running: false,
  startTime: 0,
  cycle: 0,
  samples: [],
};

// | 'START_SAMPLE' | 'END_SAMPLE' | 'TICK' | 'END'
type Action =
  | {| type: 'START', payload: number |}
  | {| type: 'START_SAMPLE', payload: number |}
  | {| type: 'END_SAMPLE', payload: number |}
  | {| type: 'TICK' |}
  | {| type: 'END' |};

function reducer(state: State = initialState, action: Action) {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        startTime: action.payload,
        running: true,
      };

    case 'START_SAMPLE': {
      const samples = [...state.samples];
      samples.push({ start: action.payload, end: -Infinity, elapsed: -Infinity });
      return {
        ...state,
        samples,
      };
    }

    case 'END_SAMPLE': {
      const samples = [...state.samples];
      const index = samples.length - 1;
      samples[index].end = action.payload;
      samples[index].elapsed = action.payload - samples[index].start;
      return {
        ...state,
        samples,
      };
    }

    case 'TICK':
      return {
        ...state,
        cycle: state.cycle + 1,
      };

    case 'END':
      return {
        ...state,
        running: false,
      };

    default:
      return state;
  }
}

function Benchmark(
  {
    component: Component,
    componentProps,
    onComplete,
    samples: numSamples,
    timeout = 10000,
    type = BenchmarkType.MOUNT,
  }: Props,
  ref: *
) {
  const [{ running, cycle, samples, startTime }, dispatch] = React.useReducer(reducer, initialState);

  React.useImperativeHandle(ref, () => ({
    start: () => {
      dispatch({ type: 'START', payload: Timing.now() });
    },
  }));

  const shouldRender = React.useMemo(() => {
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
  }, [running, cycle, type]);

  const shouldRecord = React.useMemo(() => {
    switch (type) {
      // Record every odd iteration (when mounted: first, third, etc)
      case BenchmarkType.MOUNT:
        return !((cycle + 1) % 2);
      // Record every iteration
      case BenchmarkType.UPDATE:
        return cycle !== 0;
      // Record every even iteration (when unmounted)
      case BenchmarkType.UNMOUNT:
        return !(cycle % 2);
      default:
        return false;
    }
  }, [running, cycle, type]);

  const isDone = React.useMemo(() => {
    switch (type) {
      case BenchmarkType.MOUNT:
      case BenchmarkType.UNMOUNT:
        return cycle >= numSamples * 2 - 1;
      case BenchmarkType.UPDATE:
        return cycle >= numSamples - 1;
      default:
        return true;
    }
  }, [running, cycle, numSamples, type]);

  React.useMemo(() => {
    if (running && shouldRecord) {
      dispatch({ type: 'START_SAMPLE', payload: Timing.now() });
    }
  }, [cycle, running, shouldRecord]);

  const handleComplete = React.useCallback(
    (endTime: number) => {
      dispatch({ type: 'END' });

      const runTime = endTime - startTime;
      const sortedElapsedTimes = samples.map(({ elapsed }: { elapsed: number }): number => elapsed).sort(sortNumbers);
      const mean = getMean(sortedElapsedTimes);
      const stdDev = getStdDev(sortedElapsedTimes);

      onComplete({
        startTime,
        endTime,
        runTime,
        sampleCount: samples.length,
        samples,
        max: sortedElapsedTimes[sortedElapsedTimes.length - 1],
        min: sortedElapsedTimes[0],
        median: getMedian(sortedElapsedTimes),
        mean,
        stdDev,
        p70: mean + stdDev,
        p95: mean + stdDev * 2,
        p99: mean + stdDev * 3,
      });
    },
    [onComplete, samples, startTime]
  );

  React.useEffect(() => {
    if (!running) {
      return;
    }

    const now = Timing.now();

    if (shouldRecord && samples[samples.length - 1].end < 0) {
      dispatch({ type: 'END_SAMPLE', payload: now });
      return;
    }

    const timedOut = now - startTime > timeout;
    if (!isDone || timedOut) {
      setTimeout(() => {
        dispatch({ type: 'TICK' });
      }, 1);
      return;
    } else if (isDone || timedOut) {
      handleComplete(now);
    }
  }, [running, isDone, samples, shouldRecord, shouldRender, timeout]);

  return (
    <div style={styles.content}>
      {running && shouldRender ? <Component {...componentProps} testID={cycle} /> : null}
    </div>
  );
}

export type BenchmarkRef = {| start: () => void |};

export default (React.forwardRef<Props, BenchmarkRef>(Benchmark): React.AbstractComponent<Props, *>);
