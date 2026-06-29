import type { Socket } from "socket.io";
import { io } from "./createIOServer";
import { pubClient } from "./redisClients";

export function attachSocketListeners() {
	io.on("connection", (socket: Socket) => {
		// console.log(`Socket ${socket.id} connected`);

		// frontend -> backend
		socket.on("join-frontends", (regionId: string) => {
			socket.join(`room:frontends:${regionId}`); // todo: check regionId valid
		});

		socket.on("leave-frontends", (regionId: string) => {
			socket.leave(`room:frontends:${regionId}`); // todo: check regionId valid
		});

		// driver ping -> ws: ws publishes to redis channel for worker
		socket.on(
			"driver-ping",
			(d: { driverId: string; lat: number; lng: number }) => {
				// console.log('driver-ping received');

				pubClient.geoAdd("drivers:active", {
					// todo: do this pubClient.geoAdd logic inside worker instead
					// todo: on each driver ping, should we consider removing driver from previous region and adding to new region?
					latitude: d.lat,
					longitude: d.lng,
					member: d.driverId,
				});
			},
		);
	});

	console.log("Socket listeners attached");
}
