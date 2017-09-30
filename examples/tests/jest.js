/* eslint-env jest */
import Benchmark from 'react-component-bench';
import React from 'react';
import { mount } from 'enzyme';

class Test extends React.Component {
  render() {
    return <div id="test" />;
  }
}

describe('Benchmark', () => {
  let props;
  let meanTime;

  beforeEach(() => {
    meanTime = 0;
    props = {
      component: Test,
      onComplete: jest.fn(results => {
        meanTime = results.mean;
      }),
      samples: 20
    };
  });

  it('mounts in a reasonable amount of time', () => {
    const component = mount(<Benchmark {...props} />);
    component.instance().start();
    expect(meanTime).toBeLessThan(10);
  });

  it('updates in a reasonable amount of time', () => {
    const component = mount(<Benchmark {...props} type="update" />);
    component.instance().start();
    expect(meanTime).toBeLessThan(10);
  });

  it('unmounts in a reasonable amount of time', () => {
    const component = mount(<Benchmark {...props} type="unmount" />);
    component.instance().start();
    expect(meanTime).toBeLessThan(10);
  });
});
