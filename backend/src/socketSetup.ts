import { Server, Socket } from "socket.io";
import type http from "node:http";

export default function socketSetup(httpServer: http.Server) {
	const validRegions = new Set(["karachi", "lahore"]);

	const io = new Server(httpServer, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket: Socket) => {
		// console.log(`Socket ${socket.id} connected`);

		// frontend -> backend
		socket.on("join-region", (regionId: string) => {
			console.log(`A socket joined region ${regionId}`);
			if (validRegions.has(regionId)) socket.join("region:" + regionId);
		});

		// frontend -> backend
		socket.on("leave-region", (regionId: string) => {
			console.log(`A socket left region ${regionId}`);
			socket.leave("region:" + regionId);
		});

		// driver device ping -> backend: backend broadcasts to room of the region
		socket.on(
			"driver-ping",
			(data: {
				deviceId: string;
				regionId: string;
				lat: number;
				lng: number;
			}) => {
				console.log(
					`driver-ping from ${data.deviceId} in region ${data.regionId}`,
				);
				io.to("region:" + data.regionId).emit("driver-ping", {
					deviceId: data.deviceId,
					lat: data.lat,
					lng: data.lng,
				});
			},
		);
	});
}
