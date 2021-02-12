import * as React from 'react';
import Benchmark from '../../src';
import { act, render, waitFor } from '@testing-library/react';

// This is slow on purpose for demonstration purposes
function slowFibonacci(num) {
  if (num < 2) {
    return num;
  }

  return slowFibonacci(num - 1) + slowFibonacci(num - 2);
}

describe('Benchmark', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test('mounts slowly', async () => {
    function SlowMount() {
      // Running a slow calculation on mount
      const fib = slowFibonacci(32);
      return <div>{JSON.stringify(fib)}</div>;
    }

    const ref = React.createRef();
    let results;

    const handleComplete = jest.fn((res) => {
      results = res;
    });
    render(<Benchmark component={SlowMount} onComplete={handleComplete} ref={ref} samples={20} />);
    act(() => {
      ref.current.start();
    });

    await waitFor(() => expect(handleComplete).toHaveBeenCalled(), { timeout: 10000 });
    expect(results.mean).toBeGreaterThan(10);
  });

  test('mounts in a reasonable amount of time', async () => {
    // Run the slow calculation somewhere else ahead of time
    const fib = slowFibonacci(32);
    function FastMount() {
      return <div>{JSON.stringify(fib)}</div>;
    }

    const ref = React.createRef();
    let results;
    const handleComplete = jest.fn((res) => {
      results = res;
    });
    render(<Benchmark component={FastMount} onComplete={handleComplete} ref={ref} samples={20} />);
    act(() => {
      ref.current.start();
    });

    await waitFor(() => expect(handleComplete).toHaveBeenCalled(), { timeout: 10000 });
    expect(results.mean).toBeLessThan(4);
  });

  test('updates slowly', async () => {
    function SlowUpdate() {
      // Run a slow calculation on every render
      const fib = slowFibonacci(32);
      return <div>{JSON.stringify(fib)}</div>;
    }

    const ref = React.createRef();
    let results;

    const handleComplete = jest.fn((res) => {
      results = res;
    });
    render(<Benchmark component={SlowUpdate} onComplete={handleComplete} ref={ref} samples={20} type="update" />);
    act(() => {
      ref.current.start();
    });

    await waitFor(() => expect(handleComplete).toHaveBeenCalled(), { timeout: 10000 });
    expect(results.mean).toBeGreaterThan(10);
  });

  test('updates in a reasonable amount of time', async () => {
    function FastUpdates() {
      // Memoize the slow calculation - slow mount, but fast updates
      const fib = React.useMemo(() => slowFibonacci(32), []);
      return <div>{JSON.stringify(fib)}</div>;
    }
    const ref = React.createRef();
    let results;

    const handleComplete = jest.fn((res) => {
      results = res;
    });
    render(<Benchmark component={FastUpdates} onComplete={handleComplete} ref={ref} samples={20} type="update" />);
    act(() => {
      ref.current.start();
    });

    await waitFor(() => expect(handleComplete).toHaveBeenCalled(), { timeout: 10000 });
    expect(results.mean).toBeLessThan(4);
  });

  test('unmounts slowly', async () => {
    function SlowUnmount() {
      React.useEffect(() => {
        // return function from useEffect runs on teardown
        return () => {
          slowFibonacci(32);
        };
      }, []);
      return <div />;
    }

    const ref = React.createRef();
    let results;

    const handleComplete = jest.fn((res) => {
      results = res;
    });
    render(<Benchmark component={SlowUnmount} onComplete={handleComplete} ref={ref} samples={20} type="unmount" />);
    act(() => {
      ref.current.start();
    });

    await waitFor(() => expect(handleComplete).toHaveBeenCalled(), { timeout: 10000 });
    expect(results.mean).toBeGreaterThan(10);
  });

  test('unmounts in a reasonable amount of time', async () => {
    function FastUnmount() {
      return <div />;
    }

    const ref = React.createRef();
    let results;
    const handleComplete = jest.fn((res) => {
      results = res;
    });
    render(<Benchmark component={FastUnmount} onComplete={handleComplete} ref={ref} samples={20} type="unmount" />);
    act(() => {
      ref.current.start();
    });

    await waitFor(() => expect(handleComplete).toHaveBeenCalled(), { timeout: 10000 });
    expect(results.mean).toBeLessThan(4);
  });
});
