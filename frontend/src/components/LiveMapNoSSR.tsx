"use client";

import dynamic from "next/dynamic";

const LiveMapNoSSR = dynamic(() => import("@/components/LiveMap"), {
	ssr: false,
	loading: () => <div>Loading</div>,
});

export default LiveMapNoSSR;
