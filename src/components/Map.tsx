"use client";

import {
    useEffect,
    useRef,
} from "react";

import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

import {
    Location,
} from "@/lib/geocode";

import {
    RouteOption,
} from "@/lib/geoRoute";

type Props = {
    start?: [
        number,
        number
    ];

    stops?: Location[];

    destination?: [
        number,
        number
    ];

    routes?: RouteOption[];

    selectedRouteId?:
        | string
        | null;

    loading?: boolean;
};

/*
 * ==========================================
 * FORMAT DURATION
 * ==========================================
 *
 * Mapbox duration = seconds
 */
function formatDuration(
    seconds: number
): string {
    if (
        !Number.isFinite(seconds) ||
        seconds <= 0
    ) {
        return "--";
    }

    const totalMinutes =
        Math.round(
            seconds / 60
        );

    if (
        totalMinutes < 60
    ) {
        return `${totalMinutes} min`;
    }

    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;

    if (minutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${minutes
        .toString()
        .padStart(2, "0")} min`;
}

/*
 * ==========================================
 * DELIVERY LABEL
 * ==========================================
 */

function getDeliveryLabel(
    type: RouteOption["type"]
) {
    switch (type) {
        case "fast":
            return "⚡ Fast";

        case "lite":
            return "◌ Lite";

        case "premium":
            return "◆ Premium";

        case "fragile":
            return "🛡 Fragile";

        default:
            return type;
    }
}

/*
 * ==========================================
 * ROUTE COLOR
 * ==========================================
 */

function getRouteColor(
    type: RouteOption["type"],
    selected: boolean
) {
    if (!selected) {
        return "#94A3B8";
    }

    switch (type) {
        case "fast":
            return "#F97316";

        case "lite":
            return "#4F8CFF";

        case "premium":
            return "#38BDF8";

        case "fragile":
            return "#A78BFA";

        default:
            return "#4F8CFF";
    }
}

/*
 * ==========================================
 * PICKUP ICON
 * ==========================================
 */

function createPickupElement() {
    const element =
        document.createElement(
            "div"
        );

    element.style.width =
        "44px";

    element.style.height =
        "54px";

    element.style.cursor =
        "pointer";

    element.innerHTML = `
        <svg
            width="44"
            height="54"
            viewBox="0 0 44 54"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="
                    M22 2
                    C10.5 2 2 10.5 2 21
                    C2 34.5 22 52 22 52
                    C22 52 42 34.5 42 21
                    C42 10.5 33.5 2 22 2Z
                "
                fill="#34D399"
                stroke="#FFFFFF"
                stroke-width="3"
            />

            <circle
                cx="22"
                cy="20"
                r="8"
                fill="#FFFFFF"
            />

            <circle
                cx="22"
                cy="20"
                r="4"
                fill="#34D399"
            />
        </svg>
    `;

    return element;
}

/*
 * ==========================================
 * DESTINATION ICON
 * ==========================================
 */

function createDestinationElement() {
    const element =
        document.createElement(
            "div"
        );

    element.style.width =
        "44px";

    element.style.height =
        "54px";

    element.style.cursor =
        "pointer";

    element.innerHTML = `
        <svg
            width="44"
            height="54"
            viewBox="0 0 44 54"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="
                    M22 2
                    C10.5 2 2 10.5 2 21
                    C2 34.5 22 52 22 52
                    C22 52 42 34.5 42 21
                    C42 10.5 33.5 2 22 2Z
                "
                fill="#FF5C6C"
                stroke="#FFFFFF"
                stroke-width="3"
            />

            <path
                d="
                    M17 13
                    V30
                "
                stroke="#FFFFFF"
                stroke-width="3"
                stroke-linecap="round"
            />

            <path
                d="
                    M17 14
                    H30
                    L26 18
                    L30 22
                    H17
                "
                fill="none"
                stroke="#FFFFFF"
                stroke-width="2.5"
                stroke-linejoin="round"
            />
        </svg>
    `;

    return element;
}

/*
 * ==========================================
 * STOP ICON
 * ==========================================
 */

function createStopElement(
    number: number
) {
    const element =
        document.createElement(
            "div"
        );

    element.style.width =
        "32px";

    element.style.height =
        "32px";

    element.style.borderRadius =
        "50%";

    element.style.background =
        "#111722";

    element.style.border =
        "3px solid #4F8CFF";

    element.style.display =
        "flex";

    element.style.alignItems =
        "center";

    element.style.justifyContent =
        "center";

    element.style.color =
        "#4F8CFF";

    element.style.fontSize =
        "12px";

    element.style.fontWeight =
        "700";

    element.style.boxShadow =
        "0 4px 14px rgba(0,0,0,0.35)";

    element.style.cursor =
        "pointer";

    element.innerText =
        String(number);

    return element;
}

export default function Map({
    start,
    stops = [],
    destination,
    routes = [],
    selectedRouteId = null,
    loading = false,
}: Props) {
    const mapContainer =
        useRef<HTMLDivElement | null>(
            null
        );

    const map =
        useRef<mapboxgl.Map | null>(
            null
        );

    const markers =
        useRef<
            mapboxgl.Marker[]
        >([]);

    /*
     * ==========================================
     * INITIALIZE MAP
     * ==========================================
     */

    useEffect(() => {
        const token =
            process.env
                .NEXT_PUBLIC_MAPBOX_TOKEN;

        if (!token) {
            console.error(
                "NEXT_PUBLIC_MAPBOX_TOKEN is missing"
            );

            return;
        }

        if (
            !mapContainer.current ||
            map.current
        ) {
            return;
        }

        mapboxgl.accessToken =
            token;

        const mapInstance =
            new mapboxgl.Map({
                container:
                    mapContainer.current,

                style:
                    "mapbox://styles/mapbox/streets-v12",

                center: [
                    77.209,
                    28.6139,
                ],

                zoom: 11,

                /*
                 * 3D camera angle.
                 */
                pitch: 45,

                bearing: -15,
            });

        map.current =
            mapInstance;

        /*
         * Navigation controls.
         */
        mapInstance.addControl(
            new mapboxgl.NavigationControl(
                {
                    showCompass: true,
                    visualizePitch: true,
                }
            ),
            "top-right"
        );

        /*
         * ======================================
         * MAP LOAD
         * ======================================
         */

        mapInstance.on(
            "load",
            () => {
                /*
                 * ==============================
                 * 3D TERRAIN
                 * ==============================
                 */

                if (
                    !mapInstance.getSource(
                        "mapbox-dem"
                    )
                ) {
                    mapInstance.addSource(
                        "mapbox-dem",
                        {
                            type: "raster-dem",

                            url:
                                "mapbox://mapbox.mapbox-terrain-dem-v1",

                            tileSize: 512,

                            maxzoom: 14,
                        }
                    );
                }

                mapInstance.setTerrain(
                    {
                        source:
                            "mapbox-dem",

                        exaggeration: 1.2,
                    }
                );

                /*
                 * ==============================
                 * 3D BUILDINGS
                 * ==============================
                 */

                const layers =
                    mapInstance
                        .getStyle()
                        .layers ?? [];

                const labelLayerId =
                    layers.find(
                        (layer) =>
                            layer.type ===
                                "symbol" &&
                            layer.layout?.[
                                "text-field"
                            ]
                    )?.id;

                if (
                    !mapInstance.getLayer(
                        "3d-buildings"
                    )
                ) {
                    mapInstance.addLayer(
                        {
                            id:
                                "3d-buildings",

                            source:
                                "composite",

                            "source-layer":
                                "building",

                            filter: [
                                "==",
                                "extrude",
                                "true",
                            ],

                            type:
                                "fill-extrusion",

                            minzoom: 12,

                            paint: {
                                "fill-extrusion-color":
                                    "#B8C0CC",

                                "fill-extrusion-height":
                                    [
                                        "get",
                                        "height",
                                    ],

                                "fill-extrusion-base":
                                    [
                                        "get",
                                        "min_height",
                                    ],

                                "fill-extrusion-opacity":
                                    0.7,
                            },
                        },
                        labelLayerId
                    );
                }
            }
        );

        mapInstance.on(
            "error",
            (event) => {
                console.error(
                    "Mapbox error:",
                    event
                );
            }
        );

        /*
         * Cleanup.
         */
        return () => {
            markers.current.forEach(
                (marker) =>
                    marker.remove()
            );

            markers.current = [];

            mapInstance.remove();

            map.current = null;
        };
    }, []);

    /*
     * ==========================================
     * DRAW ROUTES + MARKERS
     * ==========================================
     */

    useEffect(() => {
        if (!map.current) {
            return;
        }

        const mapInstance =
            map.current;

        const drawMap = () => {
            /*
             * ======================================
             * REMOVE OLD ROUTE LAYERS
             * ======================================
             */

            const style =
                mapInstance.getStyle();

            const routeLayers =
                style?.layers
                    ?.filter(
                        (layer) =>
                            layer.id.startsWith(
                                "delivery-route-"
                            )
                    )
                    .map(
                        (layer) =>
                            layer.id
                    ) ?? [];

            routeLayers.forEach(
                (layerId) => {
                    if (
                        mapInstance.getLayer(
                            layerId
                        )
                    ) {
                        mapInstance.removeLayer(
                            layerId
                        );
                    }
                }
            );

            /*
             * ======================================
             * REMOVE OLD SOURCES
             * ======================================
             */

            const sourceIds =
                Object.keys(
                    mapInstance
                        .getStyle()
                        .sources ?? {}
                ).filter(
                    (sourceId) =>
                        sourceId.startsWith(
                            "delivery-route-source-"
                        )
                );

            sourceIds.forEach(
                (sourceId) => {
                    if (
                        mapInstance.getSource(
                            sourceId
                        )
                    ) {
                        mapInstance.removeSource(
                            sourceId
                        );
                    }
                }
            );

            /*
             * ======================================
             * REMOVE OLD MARKERS
             * ======================================
             */

            markers.current.forEach(
                (marker) =>
                    marker.remove()
            );

            markers.current = [];

            /*
             * ======================================
             * DRAW ROUTES
             * ======================================
             */

            routes.forEach(
                (route) => {
                    if (
                        !route.coordinates ||
                        route.coordinates.length <
                            2
                    ) {
                        return;
                    }

                    const sourceId =
                        `delivery-route-source-${route.id}`;

                    const layerId =
                        `delivery-route-${route.id}`;

                    const selected =
                        route.id ===
                        selectedRouteId;

                    mapInstance.addSource(
                        sourceId,
                        {
                            type:
                                "geojson",

                            data: {
                                type:
                                    "Feature",

                                properties:
                                    {
                                        routeType:
                                            route.type,
                                    },

                                geometry: {
                                    type:
                                        "LineString",

                                    coordinates:
                                        route.coordinates,
                                },
                            },
                        }
                    );

                    mapInstance.addLayer(
                        {
                            id:
                                layerId,

                            type:
                                "line",

                            source:
                                sourceId,

                            layout: {
                                "line-join":
                                    "round",

                                "line-cap":
                                    "round",
                            },

                            paint: {
                                "line-color":
                                    getRouteColor(
                                        route.type,
                                        selected
                                    ),

                                "line-width":
                                    selected
                                        ? 7
                                        : 3,

                                "line-opacity":
                                    selected
                                        ? 1
                                        : 0.3,
                            },
                        }
                    );
                }
            );

            /*
             * ======================================
             * PICKUP
             * ======================================
             */

            if (start) {
                const marker =
                    new mapboxgl.Marker(
                        {
                            element:
                                createPickupElement(),

                            anchor:
                                "bottom",
                        }
                    )
                        .setLngLat(
                            start
                        )
                        .setPopup(
                            new mapboxgl.Popup(
                                {
                                    offset:
                                        30,
                                }
                            ).setHTML(
                                `
                                    <div style="
                                        font-family:sans-serif;
                                        padding:4px;
                                    ">
                                        <strong>
                                            Pickup
                                        </strong>
                                    </div>
                                `
                            )
                        )
                        .addTo(
                            mapInstance
                        );

                markers.current.push(
                    marker
                );
            }

            /*
             * ======================================
             * STOPS
             * ======================================
             */

            stops.forEach(
                (
                    stop,
                    index
                ) => {
                    const marker =
                        new mapboxgl.Marker(
                            {
                                element:
                                    createStopElement(
                                        index +
                                            1
                                    ),

                                anchor:
                                    "center",
                            }
                        )
                            .setLngLat(
                                [
                                    stop.longitude,
                                    stop.latitude,
                                ]
                            )
                            .setPopup(
                                new mapboxgl.Popup(
                                    {
                                        offset:
                                            20,
                                    }
                                ).setHTML(
                                    `
                                        <div style="
                                            font-family:sans-serif;
                                            padding:4px;
                                        ">
                                            <strong>
                                                Stop ${
                                                    index +
                                                    1
                                                }
                                            </strong>

                                            <div style="
                                                margin-top:4px;
                                                font-size:12px;
                                                color:#64748B;
                                            ">
                                                ${
                                                    stop.name
                                                }
                                            </div>
                                        </div>
                                    `
                                )
                            )
                            .addTo(
                                mapInstance
                            );

                    markers.current.push(
                        marker
                    );
                }
            );

            /*
             * ======================================
             * DESTINATION
             * ======================================
             */

            if (destination) {
                const marker =
                    new mapboxgl.Marker(
                        {
                            element:
                                createDestinationElement(),

                            anchor:
                                "bottom",
                        }
                    )
                        .setLngLat(
                            destination
                        )
                        .setPopup(
                            new mapboxgl.Popup(
                                {
                                    offset:
                                        30,
                                }
                            ).setHTML(
                                `
                                    <div style="
                                        font-family:sans-serif;
                                        padding:4px;
                                    ">
                                        <strong>
                                            Destination
                                        </strong>
                                    </div>
                                `
                            )
                        )
                        .addTo(
                            mapInstance
                        );

                markers.current.push(
                    marker
                );
            }

            /*
             * ======================================
             * AUTOMATIC CAMERA
             * ======================================
             */

            const selectedRoute =
                routes.find(
                    (route) =>
                        route.id ===
                        selectedRouteId
                ) ?? routes[0];

            if (
                !selectedRoute ||
                selectedRoute.coordinates
                    .length === 0
            ) {
                return;
            }

            const bounds =
                new mapboxgl.LngLatBounds();

            /*
             * Route.
             */
            selectedRoute.coordinates.forEach(
                (coordinate) => {
                    bounds.extend(
                        coordinate
                    );
                }
            );

            /*
             * Pickup.
             */
            if (start) {
                bounds.extend(
                    start
                );
            }

            /*
             * Stops.
             */
            stops.forEach(
                (stop) => {
                    bounds.extend(
                        [
                            stop.longitude,
                            stop.latitude,
                        ]
                    );
                }
            );

            /*
             * Destination.
             */
            if (destination) {
                bounds.extend(
                    destination
                );
            }

            /*
             * Fit automatically.
             *
             * maxZoom prevents the map
             * from becoming ridiculously
             * close for nearby points.
             */
            mapInstance.fitBounds(
                bounds,
                {
                    padding: {
                        top: 90,
                        right: 80,
                        bottom: 110,
                        left: 80,
                    },

                    maxZoom: 15,

                    duration: 1000,

                    pitch: 45,

                    bearing: -15,

                    essential: true,
                }
            );
        };

        /*
         * Wait for the style.
         */
        if (
            mapInstance.isStyleLoaded()
        ) {
            drawMap();
        } else {
            mapInstance.once(
                "load",
                drawMap
            );
        }

        return () => {
            mapInstance.off(
                "load",
                drawMap
            );
        };
    }, [
        routes,
        selectedRouteId,
        start,
        stops,
        destination,
    ]);

    /*
     * ==========================================
     * UI
     * ==========================================
     */

    return (
        <div className="relative h-full w-full overflow-hidden">
            <div
                ref={mapContainer}
                className="h-full w-full"
            />

            /*
             * Loading
             */
            {loading && (
                <div className="absolute left-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-lg">
                    Finding routes...
                </div>
            )}

            /*
             * Route legend
             */
            {routes.length > 0 && (
                <div className="absolute bottom-4 left-4 z-20 max-w-[270px] rounded-2xl border border-slate-200 bg-white/95 p-4 text-black shadow-xl backdrop-blur">
                    <div className="mb-3 text-xs font-bold">
                        Route options
                    </div>

                    <div className="space-y-2">
                        {routes.map(
                            (route) => {
                                const selected =
                                    route.id ===
                                    selectedRouteId;

                                return (
                                    <div
                                        key={
                                            route.id
                                        }
                                        className="flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 w-7 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        getRouteColor(
                                                            route.type,
                                                            selected
                                                        ),
                                                }}
                                            />

                                            <span>
                                                {
                                                    getDeliveryLabel(
                                                        route.type
                                                    )
                                                }
                                            </span>
                                        </div>

                                        <span className="whitespace-nowrap text-gray-500">
                                            {formatDuration(
                                                route.duration
                                            )}
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
