"use client";
import LiveMapNoSSR from "@/components/LiveMapNoSSR";
import L from "leaflet";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { autoConnect: false });

export default function page() {
	const { regionId } = useParams();

	const [deviceIds, setDeviceIds] = useState<string[]>([]); // to add/remove a marker to map
	const seenDeviceIds = useRef<Set<string>>(new Set()); // just to check if seen, otherwise add to deviceIds, to prevent `if id in deviceIds` O(n)
	const refMap = useRef<Map<string, L.Marker>>(new Map()); // device ids state -> marker element map

	useEffect(() => {
		if (!regionId) return;

		console.log("Region ID:", regionId);
		if (!socket.connected) socket.connect();

		socket.emit("join-region", regionId);

		socket.on(
			"driver-ping",
			(data: { deviceId: string; lat: number; lng: number }) => {
				console.log("driver-ping from", data);

				if (seenDeviceIds.current.has(data.deviceId)) {
					const marker = refMap.current.get(data.deviceId);

					if (marker) {
						marker.setLatLng([data.lat, data.lng]);
					}
				} else {
					seenDeviceIds.current.add(data.deviceId);
					setDeviceIds((prev) => [...prev, data.deviceId]);
				}
			},
		);

		return () => {
			socket.emit("leave-region", regionId);
			socket.off("driver-ping");
		};
	}, [regionId]);

	return (
		<div>
			<h1>Region: {regionId}</h1>

			<div className="w-[300px] h-[300px]">
				<LiveMapNoSSR deviceIds={deviceIds} refMap={refMap} />
			</div>
		</div>
	);
}
