import { useStateStore } from "@/store/useStateStore";
import { Marker, Popup, useMapEvents } from "react-leaflet";

export default function MapClicker() {
	const step = useStateStore((s) => s.step);
	const pickupCoord = useStateStore((s) => s.pickupCoord);
	const destCoord = useStateStore((s) => s.destCoord);
	const setPickupCoord = useStateStore((s) => s.setPickupCoord);
	const setDestCoord = useStateStore((s) => s.setDestCoord);

	const map = useMapEvents({
		// todo: closure of step variable might be an issue later
        // although currently it rerenders on step and view change so fresh
		click: (e) => {
			const { lat, lng } = e.latlng;
			if (step === 1) {
				if (
					!pickupCoord ||
					pickupCoord.lat !== lat ||
					pickupCoord.lng !== lng
				) {
					setPickupCoord({ lat, lng });
				}
			} else if (step === 2) {
				setDestCoord({ lat, lng });
			}

			map.flyTo(e.latlng, map.getZoom());
		},
	});

	return (
		<>
			{pickupCoord ? (
				<Marker position={[pickupCoord.lat, pickupCoord.lng]}>
					<Popup>Pickup</Popup>
				</Marker>
			) : (
				<></>
			)}

			{destCoord ? (
				<Marker position={[destCoord.lat, destCoord.lng]}>
					<Popup>Destination</Popup>
				</Marker>
			) : (
				<></>
			)}
		</>
	);
}
