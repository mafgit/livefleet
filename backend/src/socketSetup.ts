import { Server, Socket } from "socket.io";
import type http from "node:http";
import * as data from "./data.js";

export default function socketSetup(httpServer: http.Server) {
	const io = new Server(httpServer, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket: Socket) => {
		// console.log(`Socket ${socket.id} connected`);

		// frontend -> backend
		socket.on("join-frontends", () => {
			socket.join("frontends");
		});

		// frontend -> backend
		socket.on("leave-frontends", () => {
			socket.leave("frontends");
		});

		// driver driver ping -> backend: backend broadcasts to room of the region
		socket.on(
			"driver-ping",
			(d: { driverId: string; lat: number; lng: number }) => {
				data.drivers[d.driverId] = {
					lat: d.lat,
					lng: d.lng,
					timestamp: Date.now(),
				};
				// io.to("frontends").emit("driver-ping", {
				// 	driverId: d.driverId,
				// 	lat: d.lat,
				// 	lng: d.lng,
				// });
			},
		);
	});

	return io;
}
