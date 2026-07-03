import { redisClient } from "./redisClient";
import {
	HASH_PRECISIONS,
	HEARTBEAT_INTERVAL,
	LEADER_KEY,
	PX_EXPIRE_MS,
	TICK_INTERVAL,
} from "./constants";
import ngeohash from "ngeohash";

let tickerInterval: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

async function leadershipHeartbeat(serverInstanceKey: string) {
	try {
		const currentLeader = await redisClient.get(LEADER_KEY);

		if (currentLeader === serverInstanceKey) {
			// this one is already the leader
			// just send a heartbeat / renew the expiry of this key
			await redisClient.pExpire(LEADER_KEY, PX_EXPIRE_MS);
		} else if (currentLeader === null) {
			// no one is leader, try to become the leader
			const wasSet = await redisClient.set(
				LEADER_KEY,
				serverInstanceKey,
				{
					condition: "NX",
					expiration: { type: "PX", value: PX_EXPIRE_MS },
				},
			);
			if (wasSet === "OK") {
				// start interval
				if (tickerInterval) {
					clearInterval(tickerInterval);
				}

				console.log("Ticker worker has started");
				tick();
				tickerInterval = setInterval(tick, TICK_INTERVAL);
			}
		} else {
			// someone else is leader, become a follower
			if (tickerInterval) {
				clearInterval(tickerInterval);
			}
		}
	} catch (err) {
		console.error(err);
	}
}

export async function startTickerWorker(serverInstanceKey: string) {
	// heartbeats
	leadershipHeartbeat(serverInstanceKey);
	heartbeatInterval = setInterval(
		() => leadershipHeartbeat(serverInstanceKey),
		HEARTBEAT_INTERVAL,
	);
}

export async function stopTickerWorker() {
	if (heartbeatInterval) clearInterval(heartbeatInterval);
	if (tickerInterval) clearInterval(tickerInterval);
}

async function tick() {
	try {
		let cursor = "0";
		const regionDrivers: Record<
			string,
			{
				member: string;
				latitude: number;
				longitude: number;
			}[]
		> = {};

		do {
			const result = await redisClient.zScan("drivers:active", cursor, {
				MATCH: "*",
				COUNT: 1000,
			});
			cursor = result.cursor;

			const members = result.members.map((r) => r.value);

			const coords = await redisClient.geoPos("drivers:active", members);

			members.forEach((member, i) => {
				const coord = coords[i];
				if (coord) {
					const { latitude, longitude } = coord;

					const driverObj = {
						member,
						latitude: parseFloat(latitude),
						longitude: parseFloat(longitude),
					};
					for (const HASH_PRECISION of HASH_PRECISIONS) {
						const hash = ngeohash.encode(
							latitude,
							longitude,
							HASH_PRECISION,
						);

						if (hash in regionDrivers) {
							regionDrivers[hash].push(driverObj);
						} else {
							regionDrivers[hash] = [driverObj];
						}
					}
				}
			});
		} while (cursor !== "0");

		const payload = { timestamp: Date.now(), regionDrivers };

		await redisClient.publish(
			"channel:batch_pings",
			JSON.stringify(payload),
		);
	} catch (err) {
		console.error(err);
	}
}
