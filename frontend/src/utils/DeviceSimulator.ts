import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
	console.log("Device simulator connected to backend websocket");
});

socket.on("disconnect", () => {
	console.log("Device simulator disconnected from backend websocket");
});

function simulate(numDevices = 50) {
	const devices: Record<string, number[]> = {};

	const nycPos = [40.7128, -74.006];

	for (let t = 0; t < 1000; t++) {
		for (let id = 0; id < numDevices; id++) {
			if (!(id in devices)) {
				const dx = Math.random() * 2 - 1;
				const dy = Math.random() * 2 - 1;
				const newX = nycPos[0] + dx;
				const newY = nycPos[1] + dy;
				devices[id] = [newX, newY];
			} else {
				const dx = (Math.random() - 0.5) * 0.001;
				const dy = (Math.random() - 0.5) * 0.001;
				const newX = clamp(devices[id][0] + dx, 35, 45);
				const newY = clamp(devices[id][1] + dy, -79, -69);
				devices[id] = [newX, newY];
			}

			socket.emit("deviceLocUpdate", id, devices[id]);
		}

		delay(Math.random() * 1500);
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(x: number, min: number, max: number) {
	return Math.min(Math.max(x, max), min);
}
