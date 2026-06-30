import { io } from "./createIOServer";
import { subClient } from "./redisClients";

export function attachChannelSubscriptions() {
	subClient.subscribe("channel:batch_pings", handleBatchPings);

	console.log("Redis channel subscriptions attached");
}

function handleBatchPings(msg: string) {
	try {
		// console.log("Batch pings channel message received");
		const payload: {
			timestamp: number;
			regionDrivers: Record<
				string,
				{
					member: string;
					latitude: number;
					longitude: number;
				}[]
			>;
		} = JSON.parse(msg);

		for (const region in payload.regionDrivers) {
			io.to(`room:frontends:${region}`).emit(
				"driver-ping-batch",
				payload.regionDrivers[region],
			);
		}
	} catch (err) {
		console.error(err);
	}
}
