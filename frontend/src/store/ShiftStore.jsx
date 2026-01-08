import { create } from "zustand"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseUrl = `${API_URL}/api/shifts`

const useShiftStore = create((set) => ({
    shifts: [],
    loading: false,

    searchShifts: async (lat = null, log = null) => {
		set({ loading: true });
		try {
			const response = await axios.get(baseUrl, {
				params: { lat, log } 
			});
			set({ shifts: response.data, loading: false });
		} catch (error) {
			set({ shifts: [], loading: false });
			 console.error("Error fetching shifts:", error);
		}
	},
}));
export default useShiftStore;