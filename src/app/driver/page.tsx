"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    MapPin,
    Navigation,
    Phone,
    ShieldCheck,
    Star,
    Truck,
} from "lucide-react";

import DriverMap from "@/components/DriverMap";

import {
    Location,
} from "@/lib/geocode";

import {
    DeliveryType,
    RouteOption,
} from "@/lib/geoRoute";

type BookingData = {
    start: Location;
    stops: Location[];
    destination: Location;
    routes: RouteOption[];
    selectedRouteId: string;
    deliveryType: DeliveryType;
};

const DRIVER = {
    name: "Rahul Kumar",
    rating: 4.9,
    trips: 1248,
    vehicle: "Tata Ace",
    vehicleNumber: "DL 01 AB 4821",
    phone: "+91 98765 43210",
};

const DELIVERY_LABELS: Record<
    DeliveryType,
    string
> = {
    lite: "Lite Delivery",
    premium: "Premium Delivery",
    fast: "Fast Delivery",
    fragile: "Fragile Delivery",
};

export default function DriverPage() {
    const router = useRouter();

    const [booking, setBooking] =
        useState<BookingData | null>(
            null
        );

    const [
        driverProgress,
        setDriverProgress,
    ] = useState(0);

    useEffect(() => {
        const stored =
            sessionStorage.getItem(
                "deliveryBooking"
            );

        if (!stored) {
            router.replace("/");
            return;
        }

        try {
            const parsed =
                JSON.parse(
                    stored
                ) as BookingData;

            if (
                !parsed.start ||
                !parsed.destination ||
                !parsed.routes?.length ||
                !parsed.selectedRouteId
            ) {
                router.replace("/");
                return;
            }

            setBooking(parsed);
        } catch {
            router.replace("/");
        }
    }, [router]);

    if (!booking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#080B12] text-[#F8FAFC]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#263244] border-t-[#4F8CFF]" />

                    <p className="text-sm text-[#94A3B8]">
                        Loading driver details...
                    </p>
                </div>
            </main>
        );
    }

    const arrived =
        driverProgress >= 100;

    const estimatedEta =
        Math.max(
            1,
            Math.ceil(
                6 -
                    (driverProgress /
                        100) *
                        6
            )
        );

    return (
        <main className="min-h-screen bg-[#080B12] px-4 py-5 text-[#F8FAFC] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-5 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/"
                            )
                        }
                        className="flex items-center gap-2 rounded-xl border border-[#263244] bg-[#111722] px-4 py-2.5 text-sm font-medium transition hover:border-[#4F8CFF]"
                    >
                        <ArrowLeft
                            size={17}
                        />

                        Back
                    </button>

                    <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#34D399]" />

                        Live tracking
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
                    {/* LEFT */}
                    <div className="space-y-4">
                        {/* STATUS */}
                        <div className="rounded-3xl border border-[#263244] bg-[#111722] p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                                        {arrived
                                            ? "Driver arrived"
                                            : "Driver is on the way"}
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold">
                                        {arrived
                                            ? "Your driver has arrived"
                                            : "Your driver is coming"}
                                    </h1>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4F8CFF]/10 text-[#4F8CFF]">
                                    {arrived ? (
                                        <CheckCircle2
                                            size={
                                                23
                                            }
                                        />
                                    ) : (
                                        <Navigation
                                            size={
                                                23
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            {!arrived && (
                                <div className="mt-5 rounded-2xl border border-[#263244] bg-[#161D29] p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4F8CFF]/10">
                                            <Clock3
                                                size={
                                                    20
                                                }
                                                className="text-[#4F8CFF]"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-2xl font-bold">
                                                {
                                                    estimatedEta
                                                }{" "}
                                                min
                                            </p>

                                            <p className="text-xs text-[#94A3B8]">
                                                Estimated arrival
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* DRIVER */}
                        <div className="rounded-3xl border border-[#263244] bg-[#111722] p-5">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                Driver details
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4F8CFF]/10 text-2xl">
                                    👨🏻
                                </div>

                                <div className="flex-1">
                                    <h2 className="font-semibold">
                                        {
                                            DRIVER.name
                                        }
                                    </h2>

                                    <div className="mt-1 flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1 text-[#FBBF24]">
                                            <Star
                                                size={
                                                    13
                                                }
                                                fill="currentColor"
                                            />

                                            {
                                                DRIVER.rating
                                            }
                                        </span>

                                        <span className="text-[#94A3B8]">
                                            {DRIVER.trips.toLocaleString()}{" "}
                                            trips
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center gap-3 rounded-xl bg-[#161D29] p-3">
                                    <Truck
                                        size={
                                            18
                                        }
                                        className="text-[#4F8CFF]"
                                    />

                                    <div>
                                        <p className="text-sm font-medium">
                                            {
                                                DRIVER.vehicle
                                            }
                                        </p>

                                        <p className="text-xs text-[#94A3B8]">
                                            {
                                                DRIVER.vehicleNumber
                                            }
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#263244] bg-[#161D29] px-4 py-3 text-sm font-medium transition hover:border-[#4F8CFF] hover:text-[#4F8CFF]"
                                >
                                    <Phone
                                        size={
                                            17
                                        }
                                    />

                                    Call driver
                                </button>
                            </div>
                        </div>

                        {/* DELIVERY */}
                        <div className="rounded-3xl border border-[#263244] bg-[#111722] p-5">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                Delivery
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin
                                        size={
                                            19
                                        }
                                        className="mt-0.5 text-[#34D399]"
                                    />

                                    <div>
                                        <p className="text-xs text-[#94A3B8]">
                                            Pickup
                                        </p>

                                        <p className="mt-0.5 text-sm font-medium">
                                            {
                                                booking.start.name
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="ml-[9px] h-5 border-l border-dashed border-[#263244]" />

                                <div className="flex items-start gap-3">
                                    <MapPin
                                        size={
                                            19
                                        }
                                        className="mt-0.5 text-[#FF5C6C]"
                                    />

                                    <div>
                                        <p className="text-xs text-[#94A3B8]">
                                            Destination
                                        </p>

                                        <p className="mt-0.5 text-sm font-medium">
                                            {
                                                booking.destination.name
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-[#263244] pt-4">
                                <span className="text-xs text-[#94A3B8]">
                                    Delivery type
                                </span>

                                <span className="rounded-full bg-[#4F8CFF]/10 px-3 py-1 text-xs font-semibold text-[#4F8CFF]">
                                    {
                                        DELIVERY_LABELS[
                                            booking.deliveryType
                                        ]
                                    }
                                </span>
                            </div>
                        </div>

                        {/* VERIFIED */}
                        <div className="flex items-center gap-3 rounded-2xl border border-[#263244] bg-[#111722] p-4">
                            <ShieldCheck
                                size={
                                    21
                                }
                                className="text-[#34D399]"
                            />

                            <div>
                                <p className="text-sm font-medium">
                                    Driver verified
                                </p>

                                <p className="text-xs text-[#94A3B8]">
                                    Your delivery is being tracked
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MAP */}
                    <div className="relative h-[650px] overflow-hidden rounded-3xl border border-[#263244] bg-[#111722]">
                        <DriverMap
                            start={
                                booking.start
                            }
                            stops={
                                booking.stops
                            }
                            destination={
                                booking.destination
                            }
                            routes={
                                booking.routes
                            }
                            selectedRouteId={
                                booking.selectedRouteId
                            }
                            onProgress={
                                setDriverProgress
                            }
                        />

                        <div className="absolute left-4 top-4 rounded-2xl border border-[#263244] bg-[#111722]/95 px-4 py-3 shadow-xl backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4F8CFF]/10">
                                    🚚
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        {arrived
                                            ? "Driver has arrived"
                                            : "Driver heading to pickup"}
                                    </p>

                                    <p className="text-xs text-[#94A3B8]">
                                        {arrived
                                            ? "Ready for your delivery"
                                            : `${estimatedEta} min away`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!arrived && (
                            <div className="absolute bottom-5 left-1/2 w-[calc(100%-40px)] max-w-xl -translate-x-1/2 rounded-2xl border border-[#263244] bg-[#111722]/95 p-4 shadow-xl backdrop-blur">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs text-[#94A3B8]">
                                        Driver → Pickup
                                    </span>

                                    <span className="text-xs font-semibold text-[#4F8CFF]">
                                        {Math.round(
                                            driverProgress
                                        )}
                                        %
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-[#263244]">
                                    <div
                                        className="h-full rounded-full bg-[#4F8CFF] transition-all duration-500"
                                        style={{
                                            width: `${driverProgress}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
