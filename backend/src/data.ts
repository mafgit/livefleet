 type Drivers = Record<
	string,
	{
		lat: number;
		lng: number;
		timestamp: number;
	}
>
export let drivers: Drivers = {};

export function setDrivers(val: Drivers) {
    drivers = val
}