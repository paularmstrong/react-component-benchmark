import * as React from 'react';
import { Benchmark, BenchmarkType } from 'react-component-benchmark';

export function MyComponentBenchmark() {
	const ref = React.useRef();

	const handleComplete = React.useCallback((results) => {
		// eslint-disable-next-line no-console
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
