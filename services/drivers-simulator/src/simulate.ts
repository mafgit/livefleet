import { io } from "socket.io-client";
import { Drivers } from "./Drivers";
import { delay } from "./utils";

export async function simulate(
	drivers: Drivers,
	{
		NUM_DRIVERS,
		CENTER_LAT,
		CENTER_LNG,
		CHANGE_IN_LAT,
        CHANGE_IN_LNG
	}: {
		NUM_DRIVERS: number;
		CENTER_LAT: number;
		CENTER_LNG: number;
		CHANGE_IN_LAT: number;
		CHANGE_IN_LNG: number;
	},
) {
	let driver;
	while (true) {
		for (let d = 0; d < NUM_DRIVERS; d++) {
			const driverId = "driver-" + d;

			if (!(driverId in drivers)) {
				// creating driver at random locations
				const dLat =
					Math.random() * CHANGE_IN_LAT * 2 -
					CHANGE_IN_LAT;
				const dLng =
					Math.random() * CHANGE_IN_LNG * 2 -
					CHANGE_IN_LNG;

				const newLat = CENTER_LAT + dLat;
				const newLng = CENTER_LNG + dLng;

				const socket = io(process.env.WS_INGESTION_SERVICE_URL, {
					query: { driverId: driverId },
					forceNew: true,
					multiplex: false,
					transports: ["websocket"],
					reconnection: true,
					reconnectionAttempts: Infinity,
					reconnectionDelay: 1000 + Math.random() * 500,
					timeout: 5000,
					autoConnect: false,
				});

				// socket.on("connect_error", (err) => {
				// 	console.error(err);
				// });

				socket.connect();

				drivers[driverId] = {
					lat: newLat,
					lng: newLng,
					socket: socket,
				};

				driver = drivers[driverId];

				await delay(10); // to avoid 502 nginx coz of 500 socket.io connections spike, simulating real jitter
			} else {
				// moving existing driver randomly
				driver = drivers[driverId];
				const dx = Math.random() * 0.00001 * 2 - 0.00001;
				const dy = Math.random() * 0.00001 * 2 - 0.00001;

				const newLat = driver.lat + (Math.random() < 0.5 ? -1 : 1) * dx;
				const newLng = driver.lng + (Math.random() < 0.5 ? -1 : 1) * dy;
				driver.lat = newLat;
				driver.lng = newLng;
			}

			// emitting ping to ws-ingestion service
			if (driver.socket.connected) {
				driver.socket.emit("driver-ping", {
					driverId: driverId,
					lat: drivers[driverId].lat,
					lng: drivers[driverId].lng,
				});
			}
		}

		await delay(50 + Math.random() * 500);
	}
}
