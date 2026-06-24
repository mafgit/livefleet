export default function RidePageTop({
	view,
	setView,
}: {
	view: string;
	setView: React.Dispatch<React.SetStateAction<string>>;
}) {
	return (
		<>
			<h1 className="text-md font-semibold bg-primary/85 text-white py-2 px-4 absolute left-[16px] top-[16px] rounded-lg z-20">
				Scalable Real-Time Geospatial Tracking
			</h1>

			<div className="flex absolute top-[16px] right-[16px] z-20 items-center justify-center bg-primary rounded-md overflow-hidden bg-white/85 p-0.5">
				<button
					onClick={() => setView("ride")}
					className={
						"px-2 py-1 text-sm rounded-l-md " +
						(view === "ride"
							? "bg-accent text-black"
							: "opacity-90 bg-white/85 text-black")
					}
				>
					Ride View
				</button>
				<button
					onClick={() => setView("global")}
					className={
						"px-2 py-1 text-sm rounded-r-md " +
						(view === "global"
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
