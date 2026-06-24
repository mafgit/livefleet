import type { Request, Response } from "express";
import * as services from "./services.js";
import { z } from "zod";
import { LatLngSchema } from "./schemas.js";

export function hello(req: Request, res: Response) {
	res.send("Hello");
}

export async function getNearbyDrivers(req: Request, res: Response) {
	try {
		const { lat, lng } = LatLngSchema.parse(req.query);
		const drivers = await services.getNearbyDrivers(lat, lng);
		res.json({ drivers });
	} catch {
		return res.status(400).json({ error: "Provide valid lat and lng" });
	}
}
