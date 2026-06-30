import { useStateStore } from "@/store/useStateStore";
import { io } from "socket.io-client";

const socketManager = {
	socket: io("http://localhost:8080", {
		autoConnect: false,
		transports: ["websocket"],
	}),

	connectIfNotConnected() {
		if (!socketManager.socket.connected) socketManager.socket.connect();
	},

	attachDriverPingBatchListener() {
		const {} = useStateStore.getState();
		socketManager.connectIfNotConnected();
		socketManager.socket.off("driver-ping-batch");
	},
};

export default socketManager;
