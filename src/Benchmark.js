// @flow
import * as React from 'react';
import * as Timing from './timing';
import BenchmarkType from './BenchmarkType';
import { getMean, getMedian, getStdDev } from './math';
import type { BenchResultsType, Sample } from './types';

const sortNumbers = (a: number, b: number): number => a - b;

type Props = {|
  component: React.AbstractComponent<*>,
  componentProps?: {},
  includeLayout?: boolean,
  onComplete: (x: BenchResultsType) => void,
  samples: number,
  timeout?: number,
  type?: $Values<typeof BenchmarkType>,
|};

type State = {|
  running: boolean,
  startTime: number,
  cycle: number,
  samples: Array<Sample>,
|};

const initialState: State = {
  running: false,
  startTime: 0,
  cycle: 0,
  samples: [],
};

type Action =
  | {| type: 'START', payload: number |}
  | {| type: 'START_SAMPLE', payload: number |}
  | {| type: 'END_SAMPLE', payload: number |}
  | {| type: 'END_LAYOUT', payload: number |}
  | {| type: 'TICK' |}
  | {| type: 'RESET' |};

function Benchmark(
  {
    component: Component,
    componentProps,
    includeLayout = false,
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

  const shouldRender = getShouldRender(type, cycle);
  const shouldRecord = getShouldRecord(type, cycle);
  const isDone = getIsDone(type, cycle, numSamples);

  const handleComplete = React.useCallback(
    (startTime: number, endTime: number, samples: Array<Sample>) => {
      const runTime = endTime - startTime;
      const sortedElapsedTimes = samples.map(({ elapsed }: { elapsed: number }): number => elapsed).sort(sortNumbers);
      const mean = getMean(sortedElapsedTimes);
      const stdDev = getStdDev(sortedElapsedTimes);

      const result = {
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
        layout: undefined,
      };

      if (includeLayout) {
        const sortedLayoutTimes = samples.map(({ layout }: { layout: number }) => layout).sort(sortNumbers);
        const mean = getMean(sortedLayoutTimes);
        const stdDev = getStdDev(sortedLayoutTimes);
        result.layout = {
          max: sortedLayoutTimes[sortedLayoutTimes.length - 1],
          min: sortedLayoutTimes[0],
          median: getMedian(sortedLayoutTimes),
          mean,
          stdDev,
          p70: mean + stdDev,
          p95: mean + stdDev * 2,
          p99: mean + stdDev * 3,
        };
      }

      onComplete(result);

      dispatch({ type: 'RESET' });
    },
    [includeLayout, onComplete]
  );

  // useMemo causes this to actually run _before_ the component mounts
  // as opposed to useEffect, which will run after
  React.useMemo(() => {
    if (running && shouldRecord) {
      dispatch({ type: 'START_SAMPLE', payload: Timing.now() });
    }
  }, [cycle, running, shouldRecord]);

  React.useEffect(() => {
    if (!running) {
      return;
    }

    const now = Timing.now();

    if (shouldRecord && samples.length && samples[samples.length - 1].end < 0) {
      if (includeLayout && type !== BenchmarkType.UNMOUNT && document.body) {
        document.body.offsetWidth;
      }
      const layoutEnd = Timing.now();

      dispatch({ type: 'END_SAMPLE', payload: now });
      dispatch({ type: 'END_LAYOUT', payload: layoutEnd - now });
      return;
    }

    const timedOut = now - startTime > timeout;
    if (!isDone && !timedOut) {
      setTimeout(() => {
        dispatch({ type: 'TICK' });
      }, 1);
      return;
    } else if (isDone || timedOut) {
      handleComplete(startTime, now, samples);
    }
  }, [includeLayout, running, isDone, samples, shouldRecord, shouldRender, startTime, timeout]);

  return running && shouldRender ? <Component {...componentProps} testID={cycle} /> : null;
}

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
      samples.push({ start: action.payload, end: -Infinity, elapsed: -Infinity, layout: -Infinity });
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

    case 'END_LAYOUT': {
      const samples = [...state.samples];
      const index = samples.length - 1;
      samples[index].layout = action.payload;
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

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

function getShouldRender(type: $Values<typeof BenchmarkType>, cycle: number): boolean {
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
}

function getShouldRecord(type: $Values<typeof BenchmarkType>, cycle: number): boolean {
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
}

function getIsDone(type: $Values<typeof BenchmarkType>, cycle: number, numSamples: number): boolean {
  switch (type) {
    case BenchmarkType.MOUNT:
    case BenchmarkType.UNMOUNT:
      return cycle >= numSamples * 2 - 1;
    case BenchmarkType.UPDATE:
      return cycle >= numSamples;
    default:
      return true;
  }
}

export type BenchmarkRef = {| start: () => void |};

export default (React.forwardRef<Props, BenchmarkRef>(Benchmark): React.AbstractComponent<Props, *>);
