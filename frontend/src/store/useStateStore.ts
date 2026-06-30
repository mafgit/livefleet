import { LatLngObj } from "@/types/LatLngObj";
import { create } from "zustand";
import socketManager from "@/managers/socketManager";
import mapManager from "@/managers/mapManager";
import {
	fetchDriversInBoundingBox,
	fetchNearbyDrivers,
	getScreenBoundingBox,
} from "@/utils/mapUtils";
import { StateStoreType } from "@/types/StateStoreType";

export const useStateStore = create<StateStoreType>((set, get) => ({
	step: 1,
	pickupCoord: null,
	destCoord: null,
	userCoord: null,
	view: "RIDE",
	drivers: [],

	// actions
	setDestCoord: (c: LatLngObj | null) => set({ destCoord: c }),
	setPickupCoord: (c: LatLngObj | null) => set({ pickupCoord: c }),
	setUserCoord: (c: LatLngObj | null) => set({ userCoord: c }),

	changeViewToGlobal: async () => {
		const { view, clearStepsMarkersDrivers } = get();
		if (view === "GLOBAL") return;

		console.log(mapManager.leafletMap);

		if (mapManager.leafletMap && typeof window !== "undefined") {
			try {
				clearStepsMarkersDrivers();

				const bbox = getScreenBoundingBox(mapManager.leafletMap);

				const data = await fetchDriversInBoundingBox(bbox);

				set({
					drivers: Object.entries(data.drivers).map((x) => ({
						...(x[1] as LatLngObj),
						driverId: x[0],
					})),
				});

				mapManager.seenDriverIds = new Set(Object.keys(data.drivers));

				set({ view: "GLOBAL" });

				socketManager.attachDriverPingBatchListener();
			} catch {
				alert("There was an error");
			}
		}
	},

	changeViewToRide: () => {
		const { view, clearStepsMarkersDrivers } = get();
		if (view === "RIDE") return;
		clearStepsMarkersDrivers();
		set({ view: "RIDE" });
	},

	clearStepsMarkersDrivers: () => {
		set({ step: 1, pickupCoord: null, destCoord: null, drivers: [] });
		mapManager.driverIdToMarkerRefMap.clear();
		mapManager.seenDriverIds.clear();
	},

	moveForwardToStep2: async (pickupCoord: LatLngObj) => {
		// initial getting of in-radius drivers
		try {
			const data = await fetchNearbyDrivers(pickupCoord);

			set({
				drivers: Object.entries(data.drivers).map((x) => ({
					...(x[1] as LatLngObj),
					driverId: x[0],
				})),
			});

			mapManager.seenDriverIds = new Set(Object.keys(data.drivers));
			socketManager.attachDriverPingBatchListener();

			set({ step: 2 });
			mapManager.leafletMap?.setZoom(15);
		} catch {
			alert("Backend service might be down");
		}
	},

	moveForwardToStep3: (destCoord: LatLngObj) => {
		set({ step: 3 });
	},

	moveBackToStep1: () => {
		set({
			step: 1,
			destCoord: null,
			drivers: [],
		});
		mapManager.seenDriverIds.clear();
		mapManager.driverIdToMarkerRefMap.clear();
		socketManager.socket.emit("leave-frontends", "GLOBAL");
		socketManager.socket.off("driver-ping");
	},

	moveToNextStep: () => {
		const step = get().step;
		const pickupCoord = get().pickupCoord;
		const destCoord = get().destCoord;
		if (step === 1) {
			if (pickupCoord) {
				get().moveForwardToStep2(pickupCoord);
			}
		} else if (step === 2) {
			if (destCoord) {
				get().moveForwardToStep3(destCoord);
			}
		}
	},

	moveBackToStep2: () => {
		set({ step: 2 });
	},

	moveToPrevStep: () => {
		const step = get().step;
		if (step === 3) get().moveBackToStep2();
		else if (step === 2) get().moveBackToStep1();
	},
}));
