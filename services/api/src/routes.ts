import { Router } from "express";
import {
	getNearbyDrivers,
	getDriversInBoundingBox,
	hello,
} from "./controller.js";
import { serverInstanceLogger } from "./middleware.js";

const router = Router();

router.get("/", hello);

router.get("/drivers/nearby", serverInstanceLogger, getNearbyDrivers);
router.get(
	"/drivers/bounding-box",
	serverInstanceLogger,
	getDriversInBoundingBox,
);

export default router;
