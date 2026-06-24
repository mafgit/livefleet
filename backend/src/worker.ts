import * as data from "./data.js";
import { type Server } from "socket.io";

export default function worker(io: Server) {
	console.log("Worker has started");

	setInterval(() => {
		const timestamp = Date.now();
		const expired: string[] = [];

		data.setDrivers(
			Object.fromEntries(
				Object.entries(data.drivers).filter(([k, v]) => {
					if (timestamp - v.timestamp > 30000) {
						expired.push(k);
						return false;
					}

					return true;
				}),
			),
		);
        
		io.to("frontends").emit("driver-ping-batch", data.drivers, expired);
	}, 1000);
}
