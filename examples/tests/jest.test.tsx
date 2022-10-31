import * as React from 'react';
import { Benchmark } from '../../src';
import type { BenchmarkType, BenchmarkRef, BenchResultsType } from '../../src';
import { act, render, waitFor } from '@testing-library/react';

// This is slow on purpose for demonstration purposes
function slowFibonacci(num: number): number {
	if (num < 2) {
		return num;
	}

	return slowFibonacci(num - 1) + slowFibonacci(num - 2);
}

interface Props {
	component: React.ComponentType;
	props?: Record<string, unknown>;
	samples?: number;
	type?: BenchmarkType;
}

/**
 * A wrapper function to make benchmarking in tests a bit more reusable.
 * You might tune this to your specific needs
 * @param  {React.Component} options.component  The component you'd like to benchmark
 * @param  {Object} options.props               Props for your component
 * @param  {Number} options.samples             Number of samples to take. default 50 is a safe number
 * @param  {String} options.type                Lifecycle of a component ('mount', 'update', or 'unmount')
 * @return {Object}                             Results object
 */
async function runBenchmark({ component, props, samples = 50, type = 'mount' }: Props) {
	// Benchmarking requires a real time system and not mocks. Ensure you're not using fake timers
	jest.useRealTimers();

	const ref = React.createRef<BenchmarkRef>();

	let results: BenchResultsType;
	const handleComplete = jest.fn((res) => {
		results = res;
	});

	render(
		<Benchmark
			component={component}
			onComplete={handleComplete}
			ref={ref}
			samples={samples}
			componentProps={props}
			type={type}
		/>
	);

	act(() => {
		ref.current?.start();
	});

	await waitFor(() => expect(handleComplete).toHaveBeenCalled(), { timeout: 10000 });
	// @ts-ignore
	return results;
}

describe('Benchmark', () => {
	test('mounts slowly', async () => {
		function SlowMount() {
			// Running a slow calculation on mount
			const fib = slowFibonacci(32);
			return <div>{JSON.stringify(fib)}</div>;
		}

		const results = await runBenchmark({ component: SlowMount });
		expect(results.mean).toBeGreaterThan(10);
	});

	test('mounts in a reasonable amount of time', async () => {
		// Run the slow calculation somewhere else ahead of time
		const fib = slowFibonacci(32);
		function FastMount() {
			return <div>{JSON.stringify(fib)}</div>;
		}

		const results = await runBenchmark({ component: FastMount });

		expect(results.mean).toBeLessThan(4);
	});

	test('updates slowly', async () => {
		function SlowUpdate() {
			// Run a slow calculation on every render
			const fib = slowFibonacci(32);
			return <div>{JSON.stringify(fib)}</div>;
		}

		const results = await runBenchmark({ component: SlowUpdate, type: 'update' });

		expect(results.mean).toBeGreaterThan(10);
	});

	test('updates in a reasonable amount of time', async () => {
		function FastUpdates() {
			// Memoize the slow calculation - slow mount, but fast updates
			const fib = React.useMemo(() => slowFibonacci(32), []);
			return <div>{JSON.stringify(fib)}</div>;
		}

		const results = await runBenchmark({ component: FastUpdates, type: 'update' });

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

		const results = await runBenchmark({ component: SlowUnmount, type: 'unmount' });

		expect(results.mean).toBeGreaterThan(10);
	});

	test('unmounts in a reasonable amount of time', async () => {
		function FastUnmount() {
			return <div />;
		}

		const results = await runBenchmark({ component: FastUnmount, type: 'unmount' });

		expect(results.mean).toBeLessThan(4);
	});
});
