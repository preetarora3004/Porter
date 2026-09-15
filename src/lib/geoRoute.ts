import { Location } from "./geocode";

export type DeliveryType =
    | "fast"
    | "lite"
    | "premium"
    | "fragile";

export type RouteOption = {
    id: string;
    type: DeliveryType;

    // Route geometry
    coordinates: [number, number][];

    // Mapbox distance is in meters
    distance: number;

    // Mapbox duration is in seconds
    duration: number;
};

type MapboxRoute = {
    geometry: {
        coordinates: [number, number][];
    };

    distance: number;

    duration: number;
};

type MapboxResponse = {
    routes?: MapboxRoute[];
};

/*
 * Business/display order.
 *
 * Fast > Lite > Premium > Fragile
 */
export const DELIVERY_ORDER: DeliveryType[] = [
    "fast",
    "lite",
    "premium",
    "fragile",
];

/*
 * Routing strategy for each delivery type.
 */
const ROUTE_CONFIG: Record<
    DeliveryType,
    {
        profile:
            | "driving"
            | "driving-traffic";

        exclude?: string;
    }
> = {
    /*
     * Fast:
     * Traffic-aware route with the lowest ETA.
     */
    fast: {
        profile: "driving-traffic",
    },

    /*
     * Lite:
     * Standard driving route.
     */
    lite: {
        profile: "driving",
    },

    /*
     * Premium:
     * Traffic-aware, avoiding tolls.
     */
    premium: {
        profile: "driving-traffic",
        exclude: "toll",
    },

    /*
     * Fragile:
     * Prefer smoother/conservative roads.
     */
    fragile: {
        profile: "driving-traffic",
        exclude: "toll,motorway,unpaved",
    },
};

function buildCoordinates(
    points: Location[]
): string {
    return points
        .map(
            (point) =>
                `${point.longitude},${point.latitude}`
        )
        .join(";");
}

async function requestRoutes(
    points: Location[],
    type: DeliveryType
): Promise<MapboxRoute[]> {
    const token =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
        throw new Error(
            "NEXT_PUBLIC_MAPBOX_TOKEN is missing. Add it to .env.local and restart the Next.js server."
        );
    }

    const config =
        ROUTE_CONFIG[type];

    const coordinates =
        buildCoordinates(points);

    const params = new URLSearchParams({
        alternatives: "true",
        geometries: "geojson",
        overview: "full",
        steps: "false",
        access_token: token,
    });

    if (config.exclude) {
        params.set(
            "exclude",
            config.exclude
        );
    }

    const url =
        `https://api.mapbox.com/directions/v5/mapbox/${config.profile}/${coordinates}?${params.toString()}`;

    const response =
        await fetch(url);

    if (!response.ok) {
        const body =
            await response.text();

        console.error(
            `Mapbox route request failed for ${type}:`,
            body
        );

        throw new Error(
            `Mapbox routing failed for ${type}`
        );
    }

    const data =
        (await response.json()) as MapboxResponse;

    return data.routes ?? [];
}

/*
 * Compare two route geometries and determine
 * whether they are essentially the same route.
 */
function sameRoute(
    a: [number, number][],
    b: [number, number][]
): boolean {
    if (
        a.length === 0 ||
        b.length === 0
    ) {
        return false;
    }

    const sampleCount = Math.min(
        a.length,
        b.length,
        20
    );

    let difference = 0;

    for (
        let i = 0;
        i < sampleCount;
        i++
    ) {
        const aIndex = Math.min(
            a.length - 1,
            Math.floor(
                (i / (sampleCount - 1 || 1)) *
                    (a.length - 1)
            )
        );

        const bIndex = Math.min(
            b.length - 1,
            Math.floor(
                (i / (sampleCount - 1 || 1)) *
                    (b.length - 1)
            )
        );

        const pointA = a[aIndex];
        const pointB = b[bIndex];

        difference +=
            Math.abs(
                pointA[0] - pointB[0]
            ) +
            Math.abs(
                pointA[1] - pointB[1]
            );
    }

    const averageDifference =
        difference / sampleCount;

    return averageDifference < 0.0005;
}

/*
 * Remove routes that are effectively duplicates.
 */
function getUniqueRoutes(
    routes: MapboxRoute[]
): MapboxRoute[] {
    const unique: MapboxRoute[] = [];

    for (const route of routes) {
        const duplicate =
            unique.some(
                (existing) =>
                    sameRoute(
                        existing.geometry.coordinates,
                        route.geometry.coordinates
                    )
            );

        if (!duplicate) {
            unique.push(route);
        }
    }

    return unique;
}

/*
 * Choose the route with the lowest ETA.
 */
function pickFastestRoute(
    routes: MapboxRoute[]
): MapboxRoute | null {
    if (routes.length === 0) {
        return null;
    }

    return [...routes].sort(
        (a, b) =>
            a.duration - b.duration
    )[0];
}

export async function getRoutes(
    points: Location[],
    selectedType: DeliveryType
) {
    if (points.length < 2) {
        throw new Error(
            "At least two locations are required"
        );
    }

    /*
     * Request each delivery strategy separately.
     *
     * This is important because each delivery
     * type has different routing rules.
     */
    const results =
        await Promise.all(
            DELIVERY_ORDER.map(
                async (type) => {
                    try {
                        const routes =
                            await requestRoutes(
                                points,
                                type
                            );

                        return {
                            type,
                            routes,
                        };
                    } catch (error) {
                        console.error(
                            `Failed to calculate ${type} route:`,
                            error
                        );

                        return {
                            type,
                            routes: [],
                        };
                    }
                }
            )
        );

    const routeOptions: RouteOption[] =
        [];

    /*
     * Convert each routing result into
     * our RouteOption format.
     */
    for (const result of results) {
        const uniqueRoutes =
            getUniqueRoutes(
                result.routes
            );

        const selected =
            pickFastestRoute(
                uniqueRoutes
            );

        if (!selected) {
            continue;
        }

        /*
         * IMPORTANT:
         *
         * distance = meters
         * duration = seconds
         *
         * Do not swap these two.
         */
        routeOptions.push({
            id: result.type,

            type: result.type,

            coordinates:
                selected.geometry
                    .coordinates,

            distance:
                selected.distance,

            duration:
                selected.duration,
        });
    }

    /*
     * Always display:
     *
     * Fast
     * Lite
     * Premium
     * Fragile
     */
    routeOptions.sort(
        (a, b) =>
            DELIVERY_ORDER.indexOf(
                a.type
            ) -
            DELIVERY_ORDER.indexOf(
                b.type
            )
    );

    /*
     * Select the route matching the
     * currently selected delivery type.
     */
    const selectedRoute =
        routeOptions.find(
            (route) =>
                route.type ===
                selectedType
        ) ?? routeOptions[0];

    /*
     * Useful debugging.
     *
     * This makes it immediately obvious
     * whether distance and duration are
     * being mapped correctly.
     */
    console.table(
        routeOptions.map(
            (route) => ({
                type: route.type,

                distanceMeters:
                    route.distance,

                distanceKm:
                    route.distance /
                    1000,

                durationSeconds:
                    route.duration,

                durationMinutes:
                    route.duration /
                    60,
            })
        )
    );

    return {
        routes: routeOptions,

        selectedRouteId:
            selectedRoute?.id ??
            null,
    };
}
