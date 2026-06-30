import L from "leaflet";

interface MapManagerType {
	seenDriverIds: Set<string>;
	driverIdToMarkerRefMap: Map<string, L.Marker>;
	leafletMap: L.Map | null;

	initializeLeafletMap: (mapInstance: L.Map) => void;
}

const mapManager: MapManagerType = {
	seenDriverIds: new Set<string>(),
	driverIdToMarkerRefMap: new Map<string, L.Marker>(),
	leafletMap: null,

	initializeLeafletMap(mapInstance: L.Map) {
		mapManager.leafletMap = mapInstance;
	},
};

export default mapManager;
