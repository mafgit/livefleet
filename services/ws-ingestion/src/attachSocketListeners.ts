import type { Socket } from "socket.io";
import { io } from "./createIOServer";
import { pubClient } from "./redisClients";

export function attachSocketListeners(serverInstance: string) {
	io.on("connection", (socket: Socket) => {
		console.log(`A socket connected to ${serverInstance}`);

		socket.on("join-frontend-regions", (regionIds: string[]) => {
			const rooms = regionIds.map(
				(regionId) => `room:frontends:${regionId}`,
			);
			socket.join(rooms);
		});

		socket.on(
			"leave-frontend-regions",
			(regionIds: string[] | undefined) => {
				if (typeof regionIds === "undefined") {
					// i.e. leave all rooms
					socket.rooms.forEach((r) => {
						if (r !== socket.id) {
							socket.leave(r);
						}
					});
				} else {
					Promise.all(
						regionIds.map((regionId) =>
							socket.leave(`room:frontends:${regionId}`),
						),
					);
				}
			},
		);

		socket.on(
			"driver-ping",
			(d: { driverId: string; lat: number; lng: number }) => {
				// console.log('driver-ping received');

				pubClient.geoAdd("drivers:active", {
					latitude: d.lat,
					longitude: d.lng,
					member: d.driverId,
				});
			},
		);
	});

	console.log("Socket listeners attached");
}
