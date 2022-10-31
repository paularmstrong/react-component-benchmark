import * as React from 'react';
import { Benchmark } from '../Benchmark';
import type { BenchmarkRef, BenchmarkType, BenchResultsType } from '../types';
import { act, render, waitFor } from '@testing-library/react';
import type { Sample } from '../types';

interface Props {
	testID: number;
}

function Test({ testID }: Props) {
	return <div data-testid={testID}>hello</div>;
}

describe('new', () => {
	beforeEach(() => {
		jest.useRealTimers();
	});

	test('renders nothing if not running', () => {
		const { getByTestId } = render(<Benchmark component={Test} onComplete={jest.fn()} samples={2} />);
		expect(() => getByTestId('test')).toThrow('Unable to find an element');
	});

	test.each(['mount', 'update', 'unmount'] as const)('samples for %s', async (type: BenchmarkType) => {
		const ref = React.createRef<BenchmarkRef>();
		const handleComplete = jest.fn();
		render(
			<Benchmark
				ref={ref}
				component={Test}
				componentProps={{ testID: 12 }}
				onComplete={handleComplete}
				samples={10}
				type={type}
			/>
		);

		act(() => {
			ref.current && ref.current.start();
		});

		await waitFor(() =>
			expect(handleComplete).toHaveBeenCalledWith(
				expect.objectContaining({
					sampleCount: 10,
				})
			)
		);
	});

	describe('results', () => {
		let results: BenchResultsType;

		beforeAll(async () => {
			const ref = React.createRef<BenchmarkRef>();
			const handleComplete = jest.fn();
			render(<Benchmark ref={ref} component={Test} onComplete={handleComplete} samples={2} />);
			act(() => {
				ref.current && ref.current.start();
			});

			await waitFor(() =>
				// eslint-disable-next-line jest/no-standalone-expect
				expect(handleComplete).toHaveBeenCalled()
			);
			results = handleComplete.mock.calls[0][0];
		});

		test.each([
			['startTime', 'number'],
			['endTime', 'number'],
			['runTime', 'number'],
			['sampleCount', 'number'],
			['max', 'number'],
			['min', 'number'],
			['median', 'number'],
			['mean', 'number'],
			['stdDev', 'number'],
			['p70', 'number'],
			['p95', 'number'],
			['p99', 'number'],
		] as const)('include a key %s that is a %s', (key: keyof BenchResultsType, type: string) => {
			expect(results).toHaveProperty(key);
			expect(typeof results[key]).toEqual(type);
		});

		test('includes an array for samples', () => {
			expect(results).toHaveProperty('samples');
			expect(Array.isArray(results.samples)).toBe(true);
			results.samples.forEach((sample: Sample) => {
				expect(sample).toHaveProperty('start');
				expect(sample).toHaveProperty('end');
				expect(sample).toHaveProperty('elapsed');
				expect(sample).toHaveProperty('layout');
			});
		});
	});
});
