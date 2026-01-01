import React from 'react';
import { Link } from 'react-router-dom';

const ShiftCard = ({ shift }) => {
  if (!shift) {
    return <div>No shift data available</div>;
  }
	return (<Link to={`/user/${shift.id}`}>
		<div className="max-w-sm rounded overflow-hidden shadow-lg">
			<div className="px-6 py-4">
				<div className="font-bold text-xl mb-2">{ shift.project.name}</div>
			<h3>{shift.title}</h3>
                    <p>Distance: {shift.distance_km?.toFixed(2)} km</p>
                    {shift.is_within_radius && <span>📍 Nearby!</span>}
			</div>
			<div className="px-6 pt-4 pb-2">
			<span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
			<span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
			<span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#winter</span>
			</div>
		</div>
    </Link>
  );
};

export default ShiftCard;