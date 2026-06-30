import { LatLngObj } from "@/types/LatLngObj";
import type L from "leaflet";

export function getScreenBoundingBox(map: L.Map) {
	const bounds = map.getBounds();
	const sw = bounds.getSouthWest();
	const ne = bounds.getNorthEast();
	const center = bounds.getCenter();

	const heightM = map.distance(
		{ lat: sw.lat, lng: center.lng },
		{ lat: ne.lat, lng: center.lng },
	);
	const widthM = map.distance(
		{ lat: center.lat, lng: sw.lng },
		{ lat: center.lat, lng: ne.lng },
	);

	return { centerLat: center.lat, centerLng: center.lng, widthM, heightM };
}

export async function fetchDriversInBoundingBox({
	centerLat,
	centerLng,
	widthM,
	heightM,
}: {
	centerLat: number;
	centerLng: number;
	widthM: number;
	heightM: number;
}) {
	const res = await fetch(
		`http://localhost:5000/drivers/bounding-box?centerlat=${centerLat}&centerlng=${centerLng}&widthm=${widthM}&heightm=${heightM}`,
	);
	const data = await res.json();

	return data;
}

export async function fetchNearbyDrivers(pickupCoord: LatLngObj) {
	const res = await fetch(
		`http://localhost:5000/drivers/nearby?lat=${pickupCoord.lat}&lng=${pickupCoord.lng}`,
	);
	const data = await res.json();

	return data;
}
