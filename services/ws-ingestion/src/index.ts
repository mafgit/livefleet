import "dotenv/config";
import { createRedisPubSubClients } from "./redisClients";
import { io } from "./createIOServer";
import { attachSocketListeners } from "./attachSocketListeners";
import { attachChannelSubscriptions } from "./attachChannelSubscriptions";
import os from "os";

const serverInstance = os.hostname() + ":" + process.pid;

main();

async function main() {
	await createRedisPubSubClients();

	attachChannelSubscriptions(serverInstance);

	attachSocketListeners(serverInstance);

	const PORT = parseInt(process.env.PORT as string) || 8080;
	io.listen(PORT);
	console.log(
		`Websocket ingestion server instance ${serverInstance}`,
	);
}
