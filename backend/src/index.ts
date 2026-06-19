import express from "express";
import router from "./routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { type Socket } from "socket.io-client";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on('connection', (socket: Socket) => {
    console.log(`Socket ${socket.id} connected`)

    socket.on('')
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/", router);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend Running [${PORT}]`));
