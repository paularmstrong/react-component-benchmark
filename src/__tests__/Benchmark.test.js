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
});
