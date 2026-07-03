import { io, type Socket } from "socket.io-client";

let drivers: Record<
	string,
	{
		lat: number;
		lng: number;
		socket: Socket;
	}
>;

process.on("SIGINT", () => {
	console.log("Keyboard interrupt detected");

	Object.values(drivers).forEach((d) => {
		if (d.socket.connected) d.socket.disconnect();
	});

	process.exit(0);
});

async function simulate({
	NUM_DRIVERS,
	CENTER_LAT,
	CENTER_LNG,
	CHANGE_IN_LAT_OR_LNG,
}: {
	NUM_DRIVERS: number;
	CENTER_LAT: number;
	CENTER_LNG: number;
	CHANGE_IN_LAT_OR_LNG: number;
}) {
	console.log(`Simulating ${NUM_DRIVERS} drivers`);

	drivers = {};
	let driver;
	while (true) {
		for (let d = 0; d < NUM_DRIVERS; d++) {
			const driverId = "driver-" + d;

			if (!(driverId in drivers)) {
				// creating driver at random locations
				const dx =
					Math.random() * CHANGE_IN_LAT_OR_LNG * 2 -
					CHANGE_IN_LAT_OR_LNG;
				const dy =
					Math.random() * CHANGE_IN_LAT_OR_LNG * 2 -
					CHANGE_IN_LAT_OR_LNG;

				const newLat = CENTER_LAT + dx;
				const newLng = CENTER_LNG + dy;

				const socket = io(process.env.WS_INGESTION_SERVICE_URL, {
					query: { driverId: driverId },
					forceNew: true,
					multiplex: false,
					transports: ["websocket"],
					reconnection: true,
					reconnectionAttempts: Infinity,
					reconnectionDelay: 1000,
					timeout: 5000,
				});

				socket.on("connect_error", (err) => {
					console.error("Websocket connection error");
				});

				socket.on("disconnect", (reason) => {
					console.log("Socket disconnected", reason);
				});

				drivers[driverId] = {
					lat: newLat,
					lng: newLng,
					socket: socket,
				};

				driver = drivers[driverId];
			} else {
				// moving existing driver randomly
				driver = drivers[driverId];
				const dx = Math.random() * 0.00001 * 2 - 0.0001;
				const dy = Math.random() * 0.00001 * 2 - 0.0001;

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

		await delay(Math.random() * 2000);
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// function clamp(x: number, min: number, max: number) {
// 	return Math.min(Math.max(x, max), min);
// }

try {
	const NUM_DRIVERS = parseInt(process.env.NUM_DRIVERS as string);
	const CENTER_LAT = parseFloat(process.env.CENTER_LAT as string);
	const CENTER_LNG = parseFloat(process.env.CENTER_LNG as string);
	const CHANGE_IN_LAT_OR_LNG = parseFloat(
		process.env.CHANGE_IN_LAT_OR_LNG as string,
	);

	simulate({
		NUM_DRIVERS,
		CENTER_LAT,
		CENTER_LNG,
		CHANGE_IN_LAT_OR_LNG,
	});
} catch (err) {
	console.error(err);
}
