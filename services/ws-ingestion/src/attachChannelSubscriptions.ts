import { io } from "./createIOServer";
import { subClient } from "./redisClients";

export function attachChannelSubscriptions(serverInstance: string) {
	subClient.subscribe("channel:batch_pings", (msg: string) => {
		console.log(`Batch pings received by ${serverInstance}`);
		handleBatchPings(msg);
	});

	console.log("Redis channel subscriptions attached");
}

function handleBatchPings(msg: string) {
	try {
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
