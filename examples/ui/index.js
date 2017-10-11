import Benchmark, { BenchmarkType } from 'react-component-benchmark';
import React, { Component } from 'react';
import { string } from 'prop-types';

class MyComponent extends Component {
  static propTypes = {
    title: string
  };

  render() {
    return <div>{/* ... */}</div>;
  }
}

export default class MyComponentBenchmark extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      benchmarkType: BenchmarkType.MOUNT
    };
  }

  render() {
    const { benchmarkType } = this.state;

    return (
      <div>
        <button onClick={this._handleStart}>Run</button>
        <select onChange={this._handleChangeType}>
          {Object.values(BenchmarkType).map(benchType => (
            <option key={benchType} value={benchType}>
              {benchType}
            </option>
          ))}
        </select>
        <Benchmark
          component={MyComponent}
          componentProps={{ title: 'foobar' }}
          onComplete={this._handleComplete}
          ref={this._setBenchRef}
          samples={50}
          timeout={10000}
          type={benchmarkType}
        />
      </div>
    );
  }

  _handleStart = () => {
    this._benchmarkRef.start();
  };

  _handleChangeType = event => {
    this.setState({ benchmarkType: event.target.value });
  };

  _handleComplete = results => {
    console.log(results);
  };

  _setBenchRef = ref => {
    this._benchmarkRef = ref;
  };
}
