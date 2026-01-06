import React, { useEffect } from 'react';
import useShiftStore from '../store/ShiftStore';
import ShiftCard from './ShiftCard';

const ShiftList = () => {
	// Subscribe to the store state and actions
	const { shifts, loading, error, searchShifts } = useShiftStore();

	useEffect(() => {
		searchShifts(-1.26, 36.8);
	}, [searchShifts]);

	if (loading) {
		return (
			<div>
			<p>Loading shifts..</p>
			</div>
		);
	}

	if (error) {
		return (
			<div>
				<div>
					<h3>Error Loading Shifts</h3>
					<p>{error}</p>
					<button onClick={searchShifts}>
					Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
	<div>
		<div>
			<h2>Search for shift</h2>
			<div>
				<span >{shifts.length} shifts found</span>
				<button onClick={searchShifts} disabled={loading}>
				{loading ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>
		</div>

		{shifts.length === 0 ? (
		<div>
			<p>No shifts available.</p>
		</div>
		) : (
		<div>
			{shifts.map((shift) => (<ShiftCard key={shift.id} shift={shift} />))}
		</div>
		)}
	</div>
	);
};

export default ShiftList;