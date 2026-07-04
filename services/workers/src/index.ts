import { initRedis, redisClient } from "./redisClient";
import { startTickerWorker, stopTickerWorker } from "./ticker";
import "dotenv/config";
import os from "os";

main();

async function main() {
	const serverInstanceKey = os.hostname() + ":" + process.pid;
	console.log(`Starting workers ${serverInstanceKey}`);
    
	await initRedis();

	// start workers
	startTickerWorker(serverInstanceKey);

	// graceful termination
	process.on("SIGTERM", gracefulShutdown);
	process.on("SIGINT", gracefulShutdown);
}

async function gracefulShutdown() {
	// stop workers
	stopTickerWorker();

	// quit redis connection
	await redisClient.quit();

	process.exit(0);
}
