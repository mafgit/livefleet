import express from "express";
import router from "./routes.js";
import cors from "cors";
import socketSetup from "./socketSetup.js";
import { createServer } from "node:http";

const app = express();
const httpServer = createServer(app);

app.use(
	cors({
		origin: "*",
	}),
);

socketSetup(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/", router);

const PORT = 5000;
httpServer.listen(PORT, () => console.log(`Backend Running [${PORT}]`));
