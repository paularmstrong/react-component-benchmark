# React Component Benchmark [![Build Status](https://img.shields.io/travis/paularmstrong/react-component-benchmark/master.svg?style=flat-square)](https://travis-ci.org/paularmstrong/react-component-benchmark)

This project aims to provide a method for gathering benchmarks of component tree *mount*, *update*, and *unmount* timings.

Please note that the values returned are *estimates*. Since this project does not hook into the React renderer directly, the values gathered are not 100% accurate and may vary slightly because they're taken from a wrapping component. That being said, running a large sample set should give you a confident benchmark metric.

## Motivation

Historically, React has provided `react-addons-perf` in order to help gain insight into the performance of mounting, updating, and unmounting components. Unfortunately, as of React 16, it has been deprecated. Additionally, before deprecation, it was not usable in production React builds, making it less useful for many applications.

## Usage

See the [examples](./examples) directory for ideas on how you might integrate this into your own project, whether in your [user-interface](./examples/ui/index.js) or your [automated tests](./examples/tests/jest.js).

### Quick Start

```js
import Benchmark, { BenchmarkType } from 'react-component-benchmark';

class MyComponentBenchmark extends React.Component {
  render() {
    return (
      <div>
        <button onClick={this._start}>Run</button>
        <Benchmark
          component={MyComponent}
          componentProps={componentProps}
          onComplete={this._handleComplete}
          ref={this._setBenchRef}
          samples={50}
          timeout={10000}
          type={BenchmarkType.MOUNT}
        />
      </div>
    );
  }

  _start = () => { this._benchmark.start(); };

  _handleComplete = (results) => {
    console.log(results);
  };

  _setBenchRef = (ref) => { this._benchmark = ref; };
}
```

### Benchmark props

* `component`: *typeof React.Component*
* `componentProps`: *object* Properties to be given to `component` when rendering
* `onComplete`: *(x: BenchResultsType) => void*
* `samples`: *number* Samples to run (default `50`)
* `timeout`: *number* Amount of time in milliseconds to stop running (default `10000`)
* `type`: *string* One of `'mount'`, `'update'`, or `'unmount'`. Also available from `BenchmarkType`.

### In tests

See [examples/tests](./examples/tests/) for various test integrations.

## Results

*Note: All times and timestamps are in milliseconds. High resolution times provided when available.*

* `startTime`: *number* Timestamp of when the run started
* `endTime`: *number* Timestamp of when the run completed
* `runTime`: *number* Amount of time that it took to run all samples.
* `sampleCount`: *number* The number of samples actually run. May be less than requested if the `timeout` was hit.
* `samples`: *Array<{ start, end, elapsed }>*
* `max`: *number* Maximum time elapsed
* `min`: *number* Minimum time elapsed
* `median`: *number* Median time elapsed
* `mean`: *number* Mean time elapsed
* `stdDev`: *number* Standard deviation of all elapsed times
* `p70`: *number* 70th percentile for time elapsed: `mean + stdDev`
* `p95`: *number* 95th percentile for time elapsed: `mean + (stdDev * 2)`
* `p99`: *number* 99th percentile for time elapsed: `mean + (stdDev * 3)`
