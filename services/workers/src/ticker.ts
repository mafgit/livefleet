import { redisClient } from "./redisClient";
import {
	HASH_PRECISION,
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
		const allDrivers = await redisClient.geoSearchWith(
			"drivers:active",
			{ latitude: 0, longitude: 0 },
			{ width: 40000, height: 20000, unit: "km" },
			["WITHCOORD"],
		);

		const regionDrivers: Record<
			string,
			{ member: string; latitude: number; longitude: number }[]
		> = {};

		for (const driver of allDrivers) {
			if (!driver.coordinates) {
				continue;
			}

			const {
				member,
				coordinates: { latitude, longitude },
			} = driver;

			const hash = ngeohash.encode(
				driver.coordinates.latitude,
				driver.coordinates.longitude,
				HASH_PRECISION,
			);

			const driverObj = {
				member,
				latitude,
				longitude,
			};

			if (hash in regionDrivers) {
				regionDrivers[hash].push(driverObj);
			} else {
				regionDrivers[hash] = [driverObj];
			}
		}

		const payload = { timestamp: Date.now(), regionDrivers };

		await redisClient.publish(
			"channel:batch_pings",
			JSON.stringify(payload),
		);
	} catch (err) {
		console.error(err);
	}
}
