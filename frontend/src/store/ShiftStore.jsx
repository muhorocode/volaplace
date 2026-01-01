import { create } from "zustand"
import axios from "axios"

const baseUrl = "http://localhost:5000/api/shifts"

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