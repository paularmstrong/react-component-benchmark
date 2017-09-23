/* eslint-env jest */
import Benchmark from '../Benchmark';
import React from 'react';
import { shallow } from 'enzyme';

class Test extends React.Component {
  render() {
    return <div id="test" />;
  }
}

describe('Benchmark', () => {
  let props;

  beforeEach(() => {
    props = {
      component: Test,
      onComplete: jest.fn(),
      samples: 2
    };
  });

  it('renders nothing if not running', () => {
    const component = shallow(<Benchmark {...props} />);
    expect(component.get(0)).toBeNull();
  });

  it('runs the given samples', () => {
    const component = shallow(<Benchmark {...props} />);
    component.instance().start();
    expect(props.onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        sampleCount: 2
      })
    );
  });

  describe('results', () => {
    let results;
    beforeAll(() => {
      const component = shallow(<Benchmark {...props} />);
      component.instance().start();
      results = props.onComplete.mock.calls[0][0];
    });

    Object.entries({
      startTime: 'number',
      endTime: 'number',
      runTime: 'number',
      sampleCount: 'number',
      max: 'number',
      min: 'number',
      median: 'number',
      mean: 'number',
      stdDev: 'number',
      p70: 'number',
      p95: 'number',
      p99: 'number'
    }).forEach(([key, type]) => {
      it(`include a ${type} for ${key}`, () => {
        expect(results).toHaveProperty(key);
        expect(typeof results[key]).toEqual(type);
      });
    });

    it('includes an array for samples', () => {
      expect(results).toHaveProperty('samples');
      expect(Array.isArray(results.samples)).toBe(true);
      results.samples.forEach(sample => {
        expect(sample).toHaveProperty('start');
        expect(sample).toHaveProperty('end');
        expect(sample).toHaveProperty('elapsed');
      });
    });
  });
});
