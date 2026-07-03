"use client";
import RideSteps from "@/components/RideSteps";
import RidePageTop from "@/components/RidePageTop";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useStateStore } from "@/store/useStateStore";
import socketManager from "@/managers/socketManager";
import mapManager from "@/managers/mapManager";

const SelectionMapNoSSR = dynamic(() => import("@/components/SelectionMap"), {
	ssr: false,
	loading: () => (
		<div className="h-screen w-screen flex items-center justify-center">
			<h3 className="text-md font-semibold z-30 bg-primary/85 flex items-center justify-center gap-1 text-white py-2 px-4 rounded-lg">
				<img src="/bolt-solid-full.svg" width={21} /> Loading
			</h3>
		</div>
	),
});

export default function page() {
	const userCoord = useStateStore((s) => s.userCoord);
	const setUserCoord = useStateStore((s) => s.setUserCoord);
	const mapLoaded = useStateStore((s) => s.mapLoaded);

	useEffect(() => {
		// ---------------- requesting user location --------------

		if (typeof window === "undefined" || !navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setUserCoord({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				});
			},
			(err) => alert(err.message),
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000, // accept cached if within this milliseconds old
			},
		);

		return () => {
			if (socketManager.socket.connected) {
				socketManager.socket.disconnect();
			}

			if (mapManager.offlineDriversCleanupInterval) {
				clearInterval(mapManager.offlineDriversCleanupInterval);
			}
		};
	}, []);

	return (
		<div className="w-screen h-screen max-w-screen max-h-screen overflow-hidden relative">
			{userCoord && mapLoaded ? (
				<>
					<RidePageTop />

					<RideSteps />
				</>
			) : null}
            
			<main className="w-full h-full z-10">
				<SelectionMapNoSSR />
			</main>
		</div>
	);
}
