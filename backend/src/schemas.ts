import { z } from "zod";

export const LatLngSchema = z.object({
	lat: z.preprocess((x) => (x === "" ? undefined : x), z.coerce.number()),
	lng: z.preprocess((x) => (x === "" ? undefined : x), z.coerce.number()),
});
