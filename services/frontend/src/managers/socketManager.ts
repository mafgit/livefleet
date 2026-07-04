import { useStateStore } from "@/store/useStateStore";
import { ViewType } from "@/types/ViewType";
import { io } from "socket.io-client";
import mapManager from "./mapManager";
import { OFFLINE_CLEANUP_INTERVAL } from "@/constants/cleanup";

const socketManager = {
	socket: io(process.env.NEXT_PUBLIC_WS_INGESTION_SERVICE_URL, {
		autoConnect: false,
		transports: ["websocket"],
	}),

	regionsJoined: new Array<string>(),

	connectIfNotConnected() {
		if (!socketManager.socket.connected) socketManager.socket.connect();
	},

	leaveAndJoinRooms: (regionsToJoin: string[]) => {
		// diffing between already joined and to join
		const regionsJoinedSet = new Set<string>(socketManager.regionsJoined);

		const regionsToJoinSet = new Set(regionsToJoin);

		const roomsToLeave: string[] = [];
		const newRoomsToJoin: string[] = [];

		regionsJoinedSet.forEach((r) => {
			if (!regionsToJoinSet.has(r)) {
				roomsToLeave.push(r);
			}
		});

		regionsToJoinSet.forEach((r) => {
			if (!regionsJoinedSet.has(r)) {
				newRoomsToJoin.push(r);
			}
		});

		socketManager.socket.emit("leave-frontend-regions", roomsToLeave);
		socketManager.socket.emit("join-frontend-regions", newRoomsToJoin);
		socketManager.regionsJoined = regionsToJoin;
	},

	attachDriverPingBatchListener(view: ViewType) {
		socketManager.connectIfNotConnected();
		socketManager.socket.off("driver-ping-batch");
		if (mapManager.offlineDriversCleanupInterval) {
			clearInterval(mapManager.offlineDriversCleanupInterval);
		}

		if (view === "RIDE") {
			const { pickupCoord } = useStateStore.getState();
			if (!pickupCoord) return;

			const roomsToJoin =
				mapManager.getRoomsAroundPickupCoord(pickupCoord);
			socketManager.leaveAndJoinRooms(roomsToJoin);
		} else {
			const roomsToJoin = mapManager.getRoomsInScreenBoundingBox();
			socketManager.leaveAndJoinRooms(roomsToJoin);
		}

		// ping batch handler
		socketManager.socket.on(
			"driver-ping-batch",
			mapManager.handleDriverPingBatch,
		);

		// offline drivers removal interval
		mapManager.offlineDriversCleanupInterval = setInterval(
			mapManager.offlineCleanupTick,
			OFFLINE_CLEANUP_INTERVAL,
		);
	},

	cleanupEventListeners() {
		if (mapManager.offlineDriversCleanupInterval) {
			clearInterval(mapManager.offlineDriversCleanupInterval);
		}
		mapManager.seenDrivers.clear();
		socketManager.socket.emit("leave-frontend-regions", undefined);
		socketManager.socket.off("driver-ping-batch");
	},
};

export default socketManager;
