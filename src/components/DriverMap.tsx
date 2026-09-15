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
    start: Location;
    stops: Location[];
    destination: Location;
    routes: RouteOption[];
    selectedRouteId: string;
    onProgress?: (
        progress: number
    ) => void;
};

/*
 * ==========================================
 * INTERPOLATE COORDINATES
 * ==========================================
 */

function interpolate(
    from: [number, number],
    to: [number, number],
    progress: number
): [number, number] {
    return [
        from[0] +
            (to[0] - from[0]) *
                progress,

        from[1] +
            (to[1] - from[1]) *
                progress,
    ];
}

/*
 * ==========================================
 * DISTANCE IN METERS
 * ==========================================
 */

function distanceInMeters(
    a: [number, number],
    b: [number, number]
): number {
    const R = 6371000;

    const lat1 =
        (a[1] * Math.PI) / 180;

    const lat2 =
        (b[1] * Math.PI) / 180;

    const deltaLat =
        ((b[1] - a[1]) * Math.PI) /
        180;

    const deltaLng =
        ((b[0] - a[0]) * Math.PI) /
        180;

    const value =
        Math.sin(deltaLat / 2) *
            Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(value),
            Math.sqrt(1 - value)
        );

    return R * c;
}

/*
 * ==========================================
 * BEARING / DIRECTION OF TRAVEL
 * ==========================================
 */

function getBearing(
    from: [number, number],
    to: [number, number]
): number {
    const fromLng =
        (from[0] * Math.PI) / 180;

    const fromLat =
        (from[1] * Math.PI) / 180;

    const toLng =
        (to[0] * Math.PI) / 180;

    const toLat =
        (to[1] * Math.PI) / 180;

    const y =
        Math.sin(toLng - fromLng) *
        Math.cos(toLat);

    const x =
        Math.cos(fromLat) *
            Math.sin(toLat) -
        Math.sin(fromLat) *
            Math.cos(toLat) *
            Math.cos(
                toLng - fromLng
            );

    const bearing =
        (Math.atan2(y, x) * 180) /
        Math.PI;

    return (
        (bearing + 360) % 360
    );
}

/*
 * ==========================================
 * SMOOTH BEARING
 * ==========================================
 *
 * Prevents the map from spinning the long
 * way around when heading crosses 0/360.
 */

function normalizeBearingDelta(
    current: number,
    target: number
): number {
    let delta =
        target - current;

    while (delta > 180) {
        delta -= 360;
    }

    while (delta < -180) {
        delta += 360;
    }

    return current + delta;
}

/*
 * ==========================================
 * PICKUP MARKER
 * ==========================================
 */

function createPickupElement() {
    const element =
        document.createElement("div");

    element.style.width = "44px";
    element.style.height = "54px";
    element.style.cursor = "pointer";

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
 * DESTINATION MARKER
 * ==========================================
 */

function createDestinationElement() {
    const element =
        document.createElement("div");

    element.style.width = "44px";
    element.style.height = "54px";
    element.style.cursor = "pointer";

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
 * STOP MARKER
 * ==========================================
 */

function createStopElement(
    number: number
) {
    const element =
        document.createElement("div");

    element.style.width = "32px";
    element.style.height = "32px";
    element.style.borderRadius = "50%";
    element.style.background = "#111722";
    element.style.border =
        "3px solid #4F8CFF";

    element.style.display = "flex";
    element.style.alignItems =
        "center";
    element.style.justifyContent =
        "center";

    element.style.color = "#4F8CFF";
    element.style.fontSize = "12px";
    element.style.fontWeight = "700";

    element.style.boxShadow =
        "0 4px 14px rgba(0,0,0,0.35)";

    element.style.cursor =
        "pointer";

    element.textContent =
        String(number);

    return element;
}

/*
 * ==========================================
 * DRIVER MARKER
 * ==========================================
 */

function createDriverElement() {
    const element =
        document.createElement("div");

    element.style.width = "50px";
    element.style.height = "50px";
    element.style.borderRadius = "50%";

    element.style.background =
        "#111722";

    element.style.border =
        "3px solid #4F8CFF";

    element.style.display = "flex";
    element.style.alignItems =
        "center";
    element.style.justifyContent =
        "center";

    element.style.fontSize = "24px";

    element.style.boxShadow =
        "0 6px 22px rgba(0,0,0,0.5)";

    element.style.cursor =
        "pointer";

    element.textContent = "🚚";

    return element;
}

/*
 * ==========================================
 * ROUTE COLORS
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

export default function DriverMap({
    start,
    stops,
    destination,
    routes,
    selectedRouteId,
    onProgress,
}: Props) {
    const mapContainer =
        useRef<HTMLDivElement | null>(
            null
        );

    const map =
        useRef<mapboxgl.Map | null>(
            null
        );

    const driverMarker =
        useRef<mapboxgl.Marker | null>(
            null
        );

    const fixedMarkers =
        useRef<
            mapboxgl.Marker[]
        >([]);

    /*
     * Keep the last camera bearing so
     * the map rotates smoothly.
     */
    const cameraBearing =
        useRef(0);

    /*
     * ==========================================
     * SELECTED ROUTE
     * ==========================================
     */

    const selectedRoute =
        routes.find(
            (route) =>
                route.id ===
                selectedRouteId
        ) ?? routes[0];

    /*
     * ==========================================
     * MAP INITIALIZATION
     * ==========================================
     */

    useEffect(() => {
        const token =
            process.env
                .NEXT_PUBLIC_MAPBOX_TOKEN;

        if (!token) {
            console.error(
                "NEXT_PUBLIC_MAPBOX_TOKEN is missing."
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
                    start.longitude,
                    start.latitude,
                ],

                /*
                 * Navigation-style camera.
                 */
                zoom: 17.2,

                pitch: 62,

                bearing: 0,
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
         * 3D TERRAIN
         * ======================================
         */

        mapInstance.on(
            "load",
            () => {
                if (
                    !mapInstance.getSource(
                        "mapbox-dem"
                    )
                ) {
                    mapInstance.addSource(
                        "mapbox-dem",
                        {
                            type:
                                "raster-dem",

                            url:
                                "mapbox://mapbox.mapbox-terrain-dem-v1",

                            tileSize:
                                512,

                            maxzoom:
                                14,
                        }
                    );
                }

                mapInstance.setTerrain(
                    {
                        source:
                            "mapbox-dem",

                        exaggeration:
                            1.2,
                    }
                );

                /*
                 * ==================================
                 * 3D BUILDINGS
                 * ==================================
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

                            minzoom:
                                12,

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
                    "DriverMap Mapbox error:",
                    event
                );
            }
        );

        /*
         * ======================================
         * CLEANUP
         * ======================================
         */

        return () => {
            driverMarker.current?.remove();

            fixedMarkers.current.forEach(
                (marker) =>
                    marker.remove()
            );

            fixedMarkers.current =
                [];

            mapInstance.remove();

            map.current =
                null;
        };
    }, []);

    /*
     * ==========================================
     * DRAW ROUTES + FIXED MARKERS
     * ==========================================
     */

    useEffect(() => {
        if (
            !map.current ||
            !selectedRoute ||
            selectedRoute.coordinates
                .length < 2
        ) {
            return;
        }

        const mapInstance =
            map.current;

        const drawMap = () => {
            /*
             * ==================================
             * REMOVE OLD ROUTE LAYERS
             * ==================================
             */

            const style =
                mapInstance.getStyle();

            style?.layers
                ?.filter(
                    (layer) =>
                        layer.id.startsWith(
                            "driver-route-"
                        )
                )
                .forEach(
                    (layer) => {
                        if (
                            mapInstance.getLayer(
                                layer.id
                            )
                        ) {
                            mapInstance.removeLayer(
                                layer.id
                            );
                        }
                    }
                );

            /*
             * ==================================
             * REMOVE OLD SOURCES
             * ==================================
             */

            routes.forEach(
                (route) => {
                    const sourceId =
                        `driver-route-source-${route.id}`;

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
             * ==================================
             * DRAW ROUTES
             * ==================================
             */

            routes.forEach(
                (route) => {
                    if (
                        route.coordinates
                            .length <
                        2
                    ) {
                        return;
                    }

                    const sourceId =
                        `driver-route-source-${route.id}`;

                    const layerId =
                        `driver-route-${route.id}`;

                    const selected =
                        route.id ===
                        selectedRoute.id;

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
                                        : 0.25,
                            },
                        }
                    );
                }
            );

            /*
             * ==================================
             * FIXED MARKERS
             * ==================================
             */

            fixedMarkers.current.forEach(
                (marker) =>
                    marker.remove()
            );

            fixedMarkers.current =
                [];

            /*
             * PICKUP
             */

            const pickupMarker =
                new mapboxgl.Marker({
                    element:
                        createPickupElement(),

                    anchor: "bottom",
                })
                    .setLngLat([
                        start.longitude,
                        start.latitude,
                    ])
                    .setPopup(
                        new mapboxgl.Popup(
                            {
                                offset:
                                    30,
                            }
                        ).setHTML(`
                            <div style="
                                font-family:sans-serif;
                                padding:4px;
                            ">
                                <strong>
                                    Pickup
                                </strong>

                                <div style="
                                    margin-top:4px;
                                    font-size:12px;
                                    color:#64748B;
                                ">
                                    ${start.name}
                                </div>
                            </div>
                        `)
                    )
                    .addTo(
                        mapInstance
                    );

            fixedMarkers.current.push(
                pickupMarker
            );

            /*
             * STOPS
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
                            .setLngLat([
                                stop.longitude,
                                stop.latitude,
                            ])
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

                    fixedMarkers.current.push(
                        marker
                    );
                }
            );

            /*
             * DESTINATION
             */

            const destinationMarker =
                new mapboxgl.Marker({
                    element:
                        createDestinationElement(),

                    anchor: "bottom",
                })
                    .setLngLat([
                        destination.longitude,
                        destination.latitude,
                    ])
                    .setPopup(
                        new mapboxgl.Popup(
                            {
                                offset:
                                    30,
                            }
                        ).setHTML(`
                            <div style="
                                font-family:sans-serif;
                                padding:4px;
                            ">
                                <strong>
                                    Destination
                                </strong>

                                <div style="
                                    margin-top:4px;
                                    font-size:12px;
                                    color:#64748B;
                                ">
                                    ${destination.name}
                                </div>
                            </div>
                        `)
                    )
                    .addTo(
                        mapInstance
                    );

            fixedMarkers.current.push(
                destinationMarker
            );

            /*
             * IMPORTANT:
             *
             * We intentionally DO NOT call
             * fitBounds() here.
             *
             * The driver map is a navigation
             * tracking screen, so the camera
             * belongs to the driver animation.
             */
        };

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
        selectedRoute,
        start,
        stops,
        destination,
    ]);

    /*
     * ==========================================
     * DRIVER ANIMATION + NAVIGATION CAMERA
     * ==========================================
     */

    useEffect(() => {
        if (
            !map.current ||
            !selectedRoute ||
            selectedRoute.coordinates
                .length < 2
        ) {
            return;
        }

        const mapInstance =
            map.current;

        const coordinates =
            selectedRoute.coordinates;

        /*
         * Exact pickup.
         */
        const pickup: [
            number,
            number
        ] = [
            start.longitude,
            start.latitude,
        ];

        let stopped = false;

        let animationFrame:
            number | null =
            null;

        let nextSegmentTimer:
            ReturnType<
                typeof setTimeout
            > | null =
            null;

        /*
         * ==================================
         * FIND PICKUP ON ROUTE
         * ==================================
         */

        let pickupIndex = 0;

        let closestDistance =
            Infinity;

        coordinates.forEach(
            (
                coordinate,
                index
            ) => {
                const distance =
                    distanceInMeters(
                        coordinate,
                        pickup
                    );

                if (
                    distance <
                    closestDistance
                ) {
                    closestDistance =
                        distance;

                    pickupIndex =
                        index;
                }
            }
        );

        /*
         * ==================================
         * DRIVER STARTS ~8 KM AWAY
         * ==================================
         */

        let accumulatedDistance =
            0;

        let driverIndex =
            pickupIndex;

        while (
            driverIndex > 0 &&
            accumulatedDistance <
                8000
        ) {
            accumulatedDistance +=
                distanceInMeters(
                    coordinates[
                        driverIndex
                    ],
                    coordinates[
                        driverIndex - 1
                    ]
                );

            driverIndex--;
        }

        driverIndex =
            Math.max(
                1,
                driverIndex
            );

        /*
         * ==================================
         * CREATE DRIVER
         * ==================================
         */

        driverMarker.current?.remove();

        const marker =
            new mapboxgl.Marker({
                element:
                    createDriverElement(),

                anchor:
                    "center",
            })
                .setLngLat(
                    coordinates[
                        driverIndex
                    ]
                )
                .setPopup(
                    new mapboxgl.Popup(
                        {
                            offset:
                                30,
                        }
                    ).setHTML(`
                        <div style="
                            font-family:sans-serif;
                            padding:4px;
                        ">
                            <strong>
                                Rahul Kumar
                            </strong>

                            <div style="
                                margin-top:4px;
                                font-size:12px;
                                color:#64748B;
                            ">
                                Driver is approaching pickup
                            </div>
                        </div>
                    `)
                )
                .addTo(
                    mapInstance
                );

        driverMarker.current =
            marker;

        /*
         * ==================================
         * TOTAL DISTANCE
         * ==================================
         */

        let totalDistance = 0;

        for (
            let i = driverIndex;
            i > 0;
            i--
        ) {
            totalDistance +=
                distanceInMeters(
                    coordinates[i],
                    i === 1
                        ? pickup
                        : coordinates[
                              i - 1
                          ]
                );
        }

        /*
         * ==================================
         * TOTAL APPROACH TIME
         * ==================================
         *
         * ~4 minutes for ~8 km.
         */

        const totalAnimationTime =
            240000;

        let travelledDistance =
            0;

        let currentIndex =
            driverIndex;

        /*
         * ==================================
         * INITIAL CAMERA
         * ==================================
         */

        const initialFrom =
            coordinates[
                Math.max(
                    0,
                    currentIndex - 1
                )
            ];

        const initialTo =
            coordinates[
                currentIndex
            ];

        const initialBearing =
            getBearing(
                initialFrom,
                initialTo
            );

        cameraBearing.current =
            initialBearing;

        /*
         * Navigation-style starting
         * camera.
         *
         * The truck is positioned around
         * the lower-middle of the map
         * by using padding below.
         */
        mapInstance.easeTo({
            center:
                coordinates[
                    currentIndex
                ],

            zoom: 17.2,

            pitch: 62,

            bearing:
                initialBearing,

            padding: {
                top: 80,
                bottom: 220,
                left: 0,
                right: 0,
            },

            duration: 1200,

            essential: true,
        });

        onProgress?.(0);

        /*
         * ==================================
         * ANIMATE SEGMENT
         * ==================================
         */

        const animateSegment =
            () => {
                if (stopped) {
                    return;
                }

                /*
                 * ==========================
                 * ARRIVED
                 * ==========================
                 */

                if (
                    currentIndex <= 0
                ) {
                    stopped = true;

                    marker.setLngLat(
                        pickup
                    );

                    onProgress?.(
                        100
                    );

                    mapInstance.easeTo({
                        center:
                            pickup,

                        zoom: 17.2,

                        pitch: 62,

                        padding: {
                            top: 80,
                            bottom: 220,
                            left: 0,
                            right: 0,
                        },

                        duration:
                            900,

                        essential:
                            true,
                    });

                    marker.setPopup(
                        new mapboxgl.Popup(
                            {
                                offset:
                                    30,
                            }
                        ).setHTML(`
                            <div style="
                                font-family:sans-serif;
                                padding:4px;
                            ">
                                <strong>
                                    Rahul Kumar
                                </strong>

                                <div style="
                                    margin-top:4px;
                                    font-size:12px;
                                    color:#34D399;
                                ">
                                    Driver has arrived
                                </div>
                            </div>
                        `)
                    );

                    return;
                }

                const from =
                    coordinates[
                        currentIndex
                    ];

                /*
                 * Final segment ends
                 * at exact pickup.
                 */
                const to =
                    currentIndex === 1
                        ? pickup
                        : coordinates[
                              currentIndex -
                                  1
                          ];

                const segmentDistance =
                    distanceInMeters(
                        from,
                        to
                    );

                /*
                 * Segment animation time
                 * is proportional to distance.
                 */
                const duration =
                    Math.max(
                        2500,
                        (
                            segmentDistance /
                            totalDistance
                        ) *
                            totalAnimationTime
                    );

                const animationStart =
                    performance.now();

                /*
                 * Calculate movement direction.
                 */
                const targetBearing =
                    getBearing(
                        from,
                        to
                    );

                const smoothBearing =
                    normalizeBearingDelta(
                        cameraBearing.current,
                        targetBearing
                    );

                cameraBearing.current =
                    smoothBearing;

                const animate = (
                    currentTime: number
                ) => {
                    if (stopped) {
                        return;
                    }

                    const elapsed =
                        currentTime -
                        animationStart;

                    const rawProgress =
                        Math.min(
                            elapsed /
                                duration,
                            1
                        );

                    /*
                     * Smooth ease-in-out.
                     */
                    const easedProgress =
                        rawProgress < 0.5
                            ? 4 *
                              rawProgress *
                              rawProgress *
                              rawProgress
                            : 1 -
                              Math.pow(
                                  -2 *
                                      rawProgress +
                                      2,
                                  3
                              ) /
                                  2;

                    /*
                     * Driver location.
                     */
                    const position =
                        interpolate(
                            from,
                            to,
                            easedProgress
                        );

                    /*
                     * Move truck.
                     */
                    marker.setLngLat(
                        position
                    );

                    /*
                     * ==================================
                     * FOLLOW DRIVER
                     * ==================================
                     *
                     * Camera stays close to the
                     * vehicle and looks ahead.
                     */

                    mapInstance.easeTo({
                        center:
                            position,

                        zoom: 17.2,

                        pitch: 62,

                        bearing:
                            smoothBearing,

                        padding: {
                            top: 80,
                            bottom: 220,
                            left: 0,
                            right: 0,
                        },

                        duration: 180,

                        essential:
                            true,
                    });

                    /*
                     * ==================================
                     * PROGRESS
                     * ==================================
                     */

                    const segmentTravel =
                        segmentDistance *
                        rawProgress;

                    const overallDistance =
                        travelledDistance +
                        segmentTravel;

                    const progress =
                        Math.min(
                            100,
                            (
                                overallDistance /
                                totalDistance
                            ) *
                                100
                        );

                    onProgress?.(
                        progress
                    );

                    /*
                     * Continue.
                     */
                    if (
                        rawProgress < 1
                    ) {
                        animationFrame =
                            requestAnimationFrame(
                                animate
                            );

                        return;
                    }

                    /*
                     * Segment finished.
                     */
                    travelledDistance +=
                        segmentDistance;

                    currentIndex--;

                    /*
                     * ==================================
                     * ARRIVAL
                     * ==================================
                     */

                    if (
                        currentIndex <= 0
                    ) {
                        stopped = true;

                        marker.setLngLat(
                            pickup
                        );

                        onProgress?.(
                            100
                        );

                        mapInstance.easeTo({
                            center:
                                pickup,

                            zoom: 17.2,

                            pitch: 62,

                            bearing:
                                smoothBearing,

                            padding: {
                                top: 80,
                                bottom: 220,
                                left: 0,
                                right: 0,
                            },

                            duration:
                                900,

                            essential:
                                true,
                        });

                        marker.setPopup(
                            new mapboxgl.Popup(
                                {
                                    offset:
                                        30,
                                }
                            ).setHTML(`
                                <div style="
                                    font-family:sans-serif;
                                    padding:4px;
                                ">
                                    <strong>
                                        Rahul Kumar
                                    </strong>

                                    <div style="
                                        margin-top:4px;
                                        font-size:12px;
                                        color:#34D399;
                                    ">
                                        Driver has arrived
                                    </div>
                                </div>
                            `)
                        );

                        return;
                    }

                    /*
                     * Tiny pause between segments.
                     */
                    nextSegmentTimer =
                        setTimeout(
                            animateSegment,
                            80
                        );
                };

                animationFrame =
                    requestAnimationFrame(
                        animate
                    );
            };

        /*
         * Start tracking.
         */
        animateSegment();

        /*
         * ==================================
         * CLEANUP
         * ==================================
         */

        return () => {
            stopped = true;

            if (
                animationFrame !==
                null
            ) {
                cancelAnimationFrame(
                    animationFrame
                );
            }

            if (
                nextSegmentTimer !==
                null
            ) {
                clearTimeout(
                    nextSegmentTimer
                );
            }

            marker.remove();

            if (
                driverMarker.current ===
                marker
            ) {
                driverMarker.current =
                    null;
            }
        };
    }, [
        selectedRoute,
        start,
        onProgress,
    ]);

    return (
        <div className="relative h-full w-full overflow-hidden">
            <div
                ref={mapContainer}
                className="h-full w-full"
            />

            {/* Tracking indicator */}
            <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-[#111722]/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
                🚚 Live driver tracking
            </div>
        </div>
    );
}
