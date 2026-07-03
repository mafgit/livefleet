import { useStateStore } from "@/store/useStateStore";

export default function RidePageTop() {
	const view = useStateStore((s) => s.view);
	const changeViewToGlobal = useStateStore((s) => s.changeViewToGlobal);
	const changeViewToRide = useStateStore((s) => s.changeViewToRide);

	return (
		<>
			<h1 className="text-md font-semibold bg-primary/85 flex items-center justify-center gap-1 text-white py-2 px-4 absolute left-[16px] top-[16px] rounded-lg z-20">
				<img src={"/bolt-solid-full.svg"} width={21} /> LiveFleet
			</h1>

			<div className="flex absolute top-[16px] right-[16px] z-20 items-center justify-center bg-primary rounded-md overflow-hidden bg-white/85 p-0.5">
				<button
					onClick={changeViewToRide}
					className={
						"px-2 py-1 text-sm rounded-l-md " +
						(view === "RIDE"
							? "bg-accent text-black"
							: "opacity-90 bg-white/85 text-black")
					}
				>
					Ride View
				</button>
				<button
					onClick={changeViewToGlobal}
					className={
						"px-2 py-1 text-sm rounded-r-md " +
						(view === "GLOBAL"
							? "bg-accent text-black"
							: "opacity-90 bg-white/85 text-black")
					}
				>
					Global View
				</button>
			</div>
		</>
	);
}
