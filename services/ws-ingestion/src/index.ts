import { createRedisPubSubClients } from "./redisClients";
import { io } from "./createIOServer";
import { attachSocketListeners } from "./attachSocketListeners";
import { attachChannelSubscriptions } from "./attachChannelSubscriptions";

main();

async function main() {
	await createRedisPubSubClients();

	attachChannelSubscriptions();

	attachSocketListeners();

	const PORT = parseInt(process.env.PORT as string) || 8080;
	io.listen(PORT);
	console.log(`Websocket ingestion server started [${PORT}]`);
}
