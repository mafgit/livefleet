import "dotenv/config";
import { createRedisPubSubClients } from "./redisClients";
import { httpServer } from "./createIOServer";
import { attachSocketListeners } from "./attachSocketListeners";
import { attachChannelSubscriptions } from "./attachChannelSubscriptions";
import os from "os";

const serverInstance = os.hostname() + ":" + process.pid;

main();

async function main() {
	await createRedisPubSubClients();

	attachChannelSubscriptions(serverInstance);

	attachSocketListeners(serverInstance);

	const PORT = process.env.PORT ? parseInt(process.env.PORT as string) : 8080;
    
	httpServer.listen(PORT, "0.0.0.0", () => {
		console.log(`Websocket ingestion server instance ${serverInstance}`);
	});
}
