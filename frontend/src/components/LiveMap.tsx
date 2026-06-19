"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function LiveMap() {
	const lastTime = useRef(0);

	const [vehicles, setVehicles] = useState([
		{ id: "truck1", lat: 24.86, lng: 66.99, about: "This is a truck" },
		{ id: "car1", lat: 24.84, lng: 66.9, about: "This is a car" },
	]);

	const refMap = useRef<Map<string, L.Marker>>(new Map());

	const frame = useCallback(
		(timestamp: number) => {
			let dt = timestamp - lastTime.current;
			lastTime.current = timestamp;

			for (const v of vehicles) {
				const refObj = refMap.current.get(v.id);

				if (refObj) {
					const { lat, lng } = refObj.getLatLng();
					refObj.setLatLng([lat + 0.000001 * dt, lng]);
				}
			}

			requestAnimationFrame(frame);
		},
		[vehicles],
	);

	useEffect(() => {
		requestAnimationFrame(frame);
	}, []);

	return (
		<div className="w-screen h-screen">
			<MapContainer
				center={[24.86, 66.99]}
				zoom={13}
				style={{ width: "100%", height: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{vehicles.map((v) => (
					<Marker
						key={v.id}
						ref={(element) => {
							if (element) {
								// mounted
								refMap.current.set(v.id, element);
							} else {
								// unmounted
								refMap.current.delete(v.id);
							}
						}}
						position={[v.lat, v.lng]}
					>
						<Popup>{v.about}</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
}
