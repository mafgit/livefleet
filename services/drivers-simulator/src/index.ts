import "dotenv/config";

import { Drivers } from "./Drivers";
import { simulate } from "./simulate";

main();

async function main() {
	try {
		const NUM_DRIVERS = parseInt(process.env.NUM_DRIVERS as string);
		const CENTER_LAT = parseFloat(process.env.CENTER_LAT as string);
		const CENTER_LNG = parseFloat(process.env.CENTER_LNG as string);
		const CHANGE_IN_LAT_OR_LNG = parseFloat(
			process.env.CHANGE_IN_LAT_OR_LNG as string,
		);

		console.log(
			`Drivers: ${NUM_DRIVERS}, Area: (${CENTER_LAT}, ${CENTER_LNG}) ± ${CHANGE_IN_LAT_OR_LNG}`,
		);

		const drivers: Drivers = {};

		process.on("SIGINT", () => gracefulShutdown(drivers));
		process.on("SIGTERM", () => gracefulShutdown(drivers));

		await simulate(drivers, {
			NUM_DRIVERS,
			CENTER_LAT,
			CENTER_LNG,
			CHANGE_IN_LAT_OR_LNG,
		});
	} catch (err) {
		console.error(err);
	}
}

function gracefulShutdown(drivers: Drivers) {
	console.log("Keyboard interrupt detected");

	Object.values(drivers).forEach((d) => {
		if (d.socket.connected) d.socket.disconnect();
	});

	process.exit(0);
}
