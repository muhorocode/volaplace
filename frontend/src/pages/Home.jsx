import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShiftList from "../components/ShiftList"
import useShiftStore from "../store/ShiftStore";

function Home() {
	const [apiStatus, setApiStatus] = useState('checking');
	const searchShifts = useShiftStore((state) => state.searchShifts);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`)
			.then(res => res.json())
			.then(data => setApiStatus(data.status))
			.catch(() => setApiStatus('disconnected'));
	}, []);
	if (apiStatus === 'checking') return null;
	return (
		<>
			<h1>Shifts Managment</h1>
			<ShiftList onSuccess={() => {searchShifts}}/>
		</>
	);
}

export default Home;
