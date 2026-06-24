import * as data from "./data.js";

export async function getNearbyDrivers(
	lat: number,
	lng: number,
): Promise<Record<string, { lat: number; lng: number }>> {
	return data.drivers;
}
