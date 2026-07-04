import { Socket } from "socket.io-client";

export type Drivers = Record<
	string,
	{
		lat: number;
		lng: number;
		socket: Socket;
	}
>;
