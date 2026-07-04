import type { NextFunction, Request, Response } from "express";

import { hostname } from "os";

export function serverInstanceLogger(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	console.log(
		`Instance ${hostname()}:${process.pid} received /getNearbyDrivers`,
	);
	next();
}
