"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import RouteSearch from "@/components/RouteSearch";
import Map from "@/components/Map";

import { Location } from "@/lib/geocode";

import { DeliveryType, RouteOption, getRoutes } from "@/lib/geoRoute";
import { NavBar } from "@/components/NavBar";

export default function Home() {
    const router = useRouter();

    const [locations, setLocations] = useState<{
        start: Location;
        stops: Location[];
        destination: Location;
    } | null>(null);

    const [routes, setRoutes] = useState<RouteOption[]>([]);

    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

    const [deliveryType, setDeliveryType] = useState<DeliveryType>("lite");

    const [loadingRoute, setLoadingRoute] = useState(false);

    const calculateRoutes = async (
        start: Location,
        stops: Location[],
        destination: Location,
        type: DeliveryType,
    ) => {
        setLoadingRoute(true);

        try {
            const points = [start, ...stops, destination];

            console.log("Route points:", points);

            const result = await getRoutes(points, type);

            console.log("Route result:", result);

            setLocations({
                start,
                stops,
                destination,
            });

            setRoutes(result.routes);

            setSelectedRouteId(result.selectedRouteId);
        } catch (error) {
            console.error("Route calculation failed:", error);

            setRoutes([]);
            setSelectedRouteId(null);
        } finally {
            setLoadingRoute(false);
        }
    };

    const handleLocationsFound = (
        start: Location,
        stops: Location[],
        destination: Location,
        type: DeliveryType,
    ) => {
        setDeliveryType(type);

        calculateRoutes(start, stops, destination, type);
    };

    const handleDeliveryTypeChange = async (type: DeliveryType) => {
        setDeliveryType(type);

        if (!locations) {
            return;
        }

        await calculateRoutes(
            locations.start,
            locations.stops,
            locations.destination,
            type,
        );
    };

    const handleBookingComplete = () => {
        if (!locations || !selectedRouteId || routes.length === 0) {
            return;
        }

        const booking = {
            start: locations.start,
            stops: locations.stops,
            destination: locations.destination,

            routes,

            selectedRouteId,

            deliveryType,
        };

        sessionStorage.setItem("deliveryBooking", JSON.stringify(booking));

        router.push("/driver");
    };

    return (
        <main className="min-h-screen max-w-full bg-[#0B0E10]">
            <div className="w-full flex justify-center items-center">
                <NavBar />
            </div>
            <div className="min-h-screen bg-[#0B0E10] px-5 py-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
                        <div>
                            <div className="mb-6">
                                <h1 className="text-5xl font-bold tracking-tight text-[#F8FAFC]">
                                    Move anything,
                                    <br />
                                    anywhere in the city.
                                </h1>

                                <p className="mt-1 text-md text-[#94A3B8]">
                                    Enter your route below and get a perfect price.
                                </p>
                            </div>
                            <RouteSearch
                                onLocationsFound={handleLocationsFound}
                                onDeliveryTypeChange={handleDeliveryTypeChange}
                                onBookingComplete={handleBookingComplete}
                            />
                        </div>

                        <div className="h-[560px] overflow-hidden rounded-3xl border border-[#263244] bg-[#111722]">
                            <Map
                                start={
                                    locations
                                        ? [locations.start.longitude, locations.start.latitude]
                                        : undefined
                                }
                                stops={locations?.stops ?? []}
                                destination={
                                    locations
                                        ? [
                                            locations.destination.longitude,
                                            locations.destination.latitude,
                                        ]
                                        : undefined
                                }
                                routes={routes}
                                selectedRouteId={selectedRouteId}
                                loading={loadingRoute}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
