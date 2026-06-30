import { DriverIdLatLng } from "@/types/DriverIdLatLng";
import { LatLngObj } from "@/types/LatLngObj";
import { ViewType } from "@/types/ViewType";
import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { RADIUS } from "@/constants/radius";

interface MyStoreType {
	pickupCoord: LatLngObj | null;
	userCoord: LatLngObj | null;
	destCoord: LatLngObj | null;
	view: ViewType;
	drivers: DriverIdLatLng[]; // to add/remove a marker to map
	step: number;

	// non-reactive (because we won't use set({ ... }) to update them)
	_seenDriverIds: { current: Set<string> };
	_refMap: { current: Map<string, L.Marker> };
	_leafletMapRef: { current: L.Map | null };
	_socket: { current: Socket };

	// actions
	setUserCoord: (c: LatLngObj | null) => void;
	setPickupCoord: (c: LatLngObj | null) => void;
	setDestCoord: (c: LatLngObj | null) => void;
	changeViewToGlobal: () => Promise<void>;
	changeViewToRide: () => void;
	requestUserCoord: () => void;
	moveBackToStep1: () => void;
	moveForwardToStep2: (pickupCoord: LatLngObj) => Promise<void>;
	moveForwardToStep3: (pickupCoord: LatLngObj) => void;
	moveToNextStep: () => void;
	moveBackToStep2: () => void;
	moveToPrevStep: () => void;
	attachDriverPingBatchListener: () => void;
	clearStepsMarkersDrivers: () => void;
	socketConnectAndJoin: () => void;
}

export const useMyStore = create<MyStoreType>((set, get) => ({
	step: 1,
	pickupCoord: null,
	destCoord: null,
	userCoord: null,
	view: "ride",
	drivers: [],

	_socket: {
		current: io("http://localhost:8080", {
			autoConnect: false,
			transports: ["websocket"],
		}),
	},
	_refMap: { current: new Map() },
	_leafletMapRef: { current: null },
	_seenDriverIds: { current: new Set() },

	// actions
	setUserCoord: (c: LatLngObj | null) => set({ userCoord: c }),
	setDestCoord: (c: LatLngObj | null) => set({ destCoord: c }),
	setPickupCoord: (c: LatLngObj | null) => set({ pickupCoord: c }),

	changeViewToGlobal: async () => {
		const {
			view,
			clearStepsMarkersDrivers,
			attachDriverPingBatchListener,
			_leafletMapRef,
			_seenDriverIds,
		} = get();
		if (view === "global") return;
		if (_leafletMapRef.current && typeof window !== "undefined") {
			try {
				clearStepsMarkersDrivers();
				const bounds = _leafletMapRef.current.getBounds();
				const sw = bounds.getSouthWest();
				const ne = bounds.getNorthEast();
				const center = bounds.getCenter();

				const heightM = _leafletMapRef.current.distance(
					{ lat: sw.lat, lng: center.lng },
					{ lat: ne.lat, lng: center.lng },
				);
				const widthM = _leafletMapRef.current.distance(
					{ lat: center.lat, lng: sw.lng },
					{ lat: center.lat, lng: ne.lng },
				);
				const res = await fetch(
					`http://localhost:5000/drivers/bounding-box?centerlat=${center.lat}&centerlng=${center.lng}&widthm=${widthM}&heightm=${heightM}`,
				);
				const data = await res.json();

				set({
					drivers: Object.entries(data.drivers).map((x) => ({
						...(x[1] as LatLngObj),
						driverId: x[0],
					})),
				});

				_seenDriverIds.current = new Set(Object.keys(data.drivers));

				set({ view: "global" });

				attachDriverPingBatchListener();
			} catch {
				alert("There was an error");
			}
		}
	},

	changeViewToRide: () => {
		const { view, clearStepsMarkersDrivers } = get();
		if (view === "ride") return;
		clearStepsMarkersDrivers();
		set({ view: "ride" });
	},

	clearStepsMarkersDrivers: () => {
		const { _refMap, _seenDriverIds } = get();
		set({ step: 1, pickupCoord: null, destCoord: null, drivers: [] });
		_refMap.current.clear();
		_seenDriverIds.current.clear();
	},

	requestUserCoord: () => {
		if (typeof window === "undefined" || !navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(pos) =>
				set({
					userCoord: {
						lat: pos.coords.latitude,
						lng: pos.coords.longitude,
					},
				}),
			(err) => alert(err.message),
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000, // accept cached if within this milliseconds old
			},
		);
	},

	socketConnectAndJoin: () => {
		const { _socket } = get();
		if (!_socket.current.connected) _socket.current.connect();
		_socket.current.emit("join-frontends", "global");
	},

	moveForwardToStep2: async (pickupCoord: LatLngObj) => {
		const {
			_seenDriverIds,
			_leafletMapRef,
			attachDriverPingBatchListener,
		} = get();

		// initial getting of in-radius drivers
		try {
			const res = await fetch(
				`http://localhost:5000/drivers/nearby?lat=${pickupCoord!.lat}&lng=${pickupCoord!.lng}`,
			);
			const data = await res.json();
			console.log(data);
			set({
				drivers: Object.entries(data.drivers).map((x) => ({
					...(x[1] as LatLngObj),
					driverId: x[0],
				})),
			});
			_seenDriverIds.current = new Set(Object.keys(data.drivers));
			attachDriverPingBatchListener();

			set({ step: 2 });
			_leafletMapRef.current?.setZoom(15);
		} catch {
			alert("Backend service might be down");
		}
	},

	attachDriverPingBatchListener: () => {
		const {
			_socket,
			drivers,
			_seenDriverIds,
			_refMap,
			socketConnectAndJoin,
		} = get();

		socketConnectAndJoin();

		_socket.current.off("driver-ping-batch");

		_socket.current.on(
			"driver-ping-batch",
			(batch: {
				timestamp: number;
				regionDrivers: Record<
					string,
					{
						member: string;
						coordinates: {
							latitude: number;
							longitude: number;
						};
					}
				>[];
			}) => {
				const { view, pickupCoord } = get(); // get non-stale view on each ping
				console.log("Received driver-ping-batch", batch);

                
			},
		);
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
		const { _seenDriverIds, _refMap, _socket } = get();
		_seenDriverIds.current.clear();
		_refMap.current.clear();
		_socket.current.emit("leave-frontends", "global");
		_socket.current.off("driver-ping");
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
