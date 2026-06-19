import { Router } from "express";
import { hello } from "./controller.js";

const router = Router();

router.get("/", hello);

export default router;
