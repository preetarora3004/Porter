"use client";

import {
    FormEvent,
    useState,
} from "react";

import {
    geocode,
    Location,
} from "@/lib/geocode";

import {
    DeliveryType,
} from "@/lib/geoRoute";

import {
    InputButton,
} from "./inputButton";

type Props = {
    onLocationsFound: (
        start: Location,
        stops: Location[],
        destination: Location,
        deliveryType: DeliveryType
    ) => void;

    onDeliveryTypeChange: (
        deliveryType: DeliveryType
    ) => void;

    onBookingComplete: () => void;
};

export default function RouteSearch({
    onLocationsFound,
    onDeliveryTypeChange,
    onBookingComplete,
}: Props) {
    const [start, setStart] =
        useState("");

    const [destination, setDestination] =
        useState("");

    const [stops, setStops] =
        useState<string[]>([]);

    const [deliveryType, setDeliveryType] =
        useState<DeliveryType>("lite");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleDeliveryTypeChange = (
        type: DeliveryType
    ) => {
        setDeliveryType(type);

        onDeliveryTypeChange(type);
    };

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (
            !start.trim() ||
            !destination.trim()
        ) {
            setError(
                "Enter pickup and destination"
            );

            return;
        }

        setLoading(true);
        setError("");

        try {
            const stopQueries =
                stops.filter(
                    (stop) =>
                        stop.trim().length > 0
                );

            const results =
                await Promise.all([
                    geocode(start),

                    ...stopQueries.map(
                        (stop) =>
                            geocode(stop)
                    ),

                    geocode(destination),
                ]);

            const startLocation =
                results[0];

            const destinationLocation =
                results[
                    results.length - 1
                ];

            const stopLocations =
                results.slice(1, -1);

            if (!startLocation) {
                setError(
                    "Pickup location not found"
                );

                return;
            }

            if (!destinationLocation) {
                setError(
                    "Destination not found"
                );

                return;
            }

            if (
                stopLocations.some(
                    (stop) => !stop
                )
            ) {
                setError(
                    "One or more stops could not be found"
                );

                return;
            }

            const validStops =
                stopLocations.filter(
                    (
                        stop
                    ): stop is Location =>
                        stop !== null
                );

            onLocationsFound(
                startLocation,
                validStops,
                destinationLocation,
                deliveryType
            );
        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong while finding the route"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full rounded-3xl border border-[#25303A] bg-[#0B0E10] shadow-xl shadow-[#1C242A]"
        >
            <InputButton
                pickup={start}
                drop={destination}
                setPickup={setStart}
                setDrop={setDestination}
                stops={stops}
                setStops={setStops}
                loading={loading}
                error={error}
                deliveryType={deliveryType}
                setDeliveryType={
                    handleDeliveryTypeChange
                }
                onBookingComplete={
                    onBookingComplete
                }
            />
        </form>
    );
}
