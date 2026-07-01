import ngeohash from "ngeohash";
import { redisClient } from "./redisClient";
import { HASH_PRECISION } from "./constants";

export default function ticker() {
	console.log("Ticker has started");

	setInterval(async () => {
		const allDrivers = await redisClient.geoSearchWith(
			"drivers:active",
			{ latitude: 0, longitude: 0 },
			{ radius: 20000, unit: "km" },
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

		redisClient.publish("channel:batch_pings", JSON.stringify(payload));
	}, 2000);
}
