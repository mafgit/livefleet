"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RefObject, useRef } from "react";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function LiveMap({
	refMap,
	deviceIds,
}: {
	refMap: RefObject<Map<string, L.Marker>>;
	deviceIds: string[];
}) {
	return (
		<MapContainer
			center={[24.86, 66.99]} // todo: based on region
			zoom={13}
			style={{ width: "100%", height: "100%" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{/* vehicles loop for separate markers  */}
			{deviceIds.map((v) => (
				<Marker
					key={v}
					ref={(element) => {
						if (element) {
							// mounted
							refMap.current.set(v, element);
						} else {
							// unmounted
							refMap.current.delete(v);
						}
					}}
					position={[24, 66]} // todo: remove fake position
				>
					<Popup>{v}</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}
