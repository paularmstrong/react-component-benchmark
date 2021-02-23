# React Component Benchmark [![Build Status](https://img.shields.io/travis/paularmstrong/react-component-benchmark/master.svg?style=flat-square)](https://travis-ci.org/paularmstrong/react-component-benchmark)

This project aims to provide a method for gathering benchmarks of component tree _mount_, _update_, and _unmount_ timings.

Please note that the values returned are _estimates_. Since this project does not hook into the React renderer directly, the values gathered are not 100% accurate and may vary slightly because they're taken from a wrapping component. That being said, running a large sample set should give you a confident benchmark metric.

## Motivation

Historically, React has provided `react-addons-perf` in order to help gain insight into the performance of mounting, updating, and unmounting components. Unfortunately, as of React 16, it has been deprecated. Additionally, before deprecation, it was not usable in production React builds, making it less useful for many applications.

## Usage

See the [examples](./examples) directory for ideas on how you might integrate this into your own project, whether in your [user-interface](#build-a-ui) or your [automated tests](./examples/tests/jest.test.js).

### Quick Start

```js
import Benchmark, { BenchmarkType } from 'react-component-benchmark';

function MyComponentBenchmark() {
  const ref = React.useRef();

  const handleComplete = React.useCallback((results) => {
    console.log(results);
  }, []);

  const handleStart = () => {
    ref.start();
  };

  return (
    <div>
      <button onClick={handleStart}>Run</button>
      <Benchmark
        component={MyComponent}
        componentProps={componentProps}
        onComplete={handleComplete}
        ref={ref}
        samples={50}
        timeout={10000}
        type={BenchmarkType.MOUNT}
      />
    </div>
  );
}
```

### In tests

See [examples/tests](./examples/tests/) for various test integrations.

### Build a UI

- Demo: https://csb-uy88d.netlify.app/
  - See, edit, and fork the code from https://codesandbox.io/s/react-component-benchmark-uy88d
  - You can also do the same using Preact! https://codesandbox.io/s/react-component-benchmark-preact-69inw

### Benchmark props

| key              | type                            | description                                                                                                                                                                         |
| ---------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component`      | `typeof React.Component`        | The component that you would like to benchmark                                                                                                                                      |
| `componentProps` | `object`                        | Properties to be given to `component` when rendering                                                                                                                                |
| `includeLayout`  | `boolean`                       | Estimate the amount of time that the browser's rendering engine requires to layout the rendered HTML. Only available for `'mount'` and `'update'` benchmark types. Default: `false` |
| `onComplete`     | `(x: BenchResultsType) => void` | Receives the benchmark [results](#results) when the benchmarking is complete                                                                                                        |
| `samples`        | `number`                        | Samples to run (default `50`)                                                                                                                                                       |
| `timeout`        | `number`                        | Amount of time in milliseconds to stop running (default `10000`)                                                                                                                    |
| `type`           | `string`                        | One of `'mount'`, `'update'`, or `'unmount'`. Also available from `BenchmarkType`.                                                                                                  |

## Results

> Note: All times and timestamps are in milliseconds. High resolution times provided when available.

| key           | type                             | description                                                                                                |
| ------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `...`         | `...ComputedResult`              | All values from the `ComputedResult` table                                                                 |
| `startTime`   | `number`                         | Timestamp of when the run started                                                                          |
| `endTime`     | `number`                         | Timestamp of when the run completed                                                                        |
| `runTime`     | `number`                         | Amount of time that it took to run all samples.                                                            |
| `sampleCount` | `number`                         | The number of samples actually run. May be less than requested if the `timeout` was hit.                   |
| `samples`     | `Array<{ start, end, elapsed }>` | Raw sample data                                                                                            |
| `layout`      | `ComputedResult`                 | The benchmark results for the browser rendering engine layout, if available (see `includeLayout` property) |

### `ComputedResult`

| key      | type     | description                                             |
| -------- | -------- | ------------------------------------------------------- |
| `max`    | `number` | Maximum time elapsed                                    |
| `min`    | `number` | Minimum time elapsed                                    |
| `median` | `number` | Median time elapsed                                     |
| `mean`   | `number` | Mean time elapsed                                       |
| `stdDev` | `number` | Standard deviation of all elapsed times                 |
| `p70`    | `number` | 70th percentile for time elapsed: `mean + stdDev`       |
| `p95`    | `number` | 95th percentile for time elapsed: `mean + (stdDev * 2)` |
| `p99`    | `number` | 99th percentile for time elapsed: `mean + (stdDev * 3)` |
