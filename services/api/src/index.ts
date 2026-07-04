import express from "express";
import router from "./routes";
import cors from "cors";
import { initRedis } from "./redisClient";

const app = express();

app.set("trust proxy", 1);

app.use(
	cors({
		origin: "*",
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initRedis();

// routes
app.use("/", router);

const PORT = 5000;

import { hostname } from "os";
app.listen(PORT, () =>
	console.log(`API server instance ${hostname()}:${process.pid}`),
);
