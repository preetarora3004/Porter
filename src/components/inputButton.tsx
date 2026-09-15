"use client";

import {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Bike,
    CheckCircle2,
    Circle,
    Clock3,
    Crown,
    MapPin,
    Package,
    Phone,
    Plus,
    Search,
    ShieldCheck,
    Truck,
    UserRound,
    X,
    Zap,
} from "lucide-react";

import {
    DeliveryType,
} from "@/lib/geoRoute";

const VEHICLES = [
    {
        id: "bike",
        label: "2 Wheeler",
        icon: Bike,
        eta: "4 min",
        price: 85,
    },
    {
        id: "mini",
        label: "Mini Truck",
        icon: Truck,
        eta: "9 min",
        price: 420,
    },
    {
        id: "truck",
        label: "Truck",
        icon: Truck,
        eta: "14 min",
        price: 980,
    },
];

const DELIVERY_TYPES: {
    id: DeliveryType;
    label: string;
    description: string;
    icon: typeof Package;
    extra: number;
}[] = [
    {
        id: "lite",
        label: "Lite",
        description: "Standard delivery",
        icon: Package,
        extra: 0,
    },
    {
        id: "premium",
        label: "Premium",
        description:
            "Extra care & handling",
        icon: Crown,
        extra: 80,
    },
    {
        id: "fast",
        label: "Fast",
        description:
            "Priority delivery",
        icon: Zap,
        extra: 150,
    },
    {
        id: "fragile",
        label: "Fragile",
        description:
            "Special care for fragile items",
        icon: ShieldCheck,
        extra: 120,
    },
];

const MOCK_DRIVER = {
    name: "Rahul Kumar",
    rating: 4.9,
    trips: 1248,
    vehicle: "Tata Ace",
    vehicleNumber: "DL 01 AB 4821",
    phone: "+91 98765 43210",
    eta: 6,
};

const MAX_STOPS = 4;

type Props = {
    pickup: string;
    drop: string;

    setPickup: Dispatch<
        SetStateAction<string>
    >;

    setDrop: Dispatch<
        SetStateAction<string>
    >;

    stops: string[];

    setStops: Dispatch<
        SetStateAction<string[]>
    >;

    loading: boolean;
    error: string;

    deliveryType: DeliveryType;

    setDeliveryType: (
        type: DeliveryType
    ) => void;

    onBookingComplete: () => void;
};

type BookingStatus =
    | "idle"
    | "searching"
    | "driver-found";

export function InputButton({
    pickup,
    drop,
    setPickup,
    setDrop,
    stops,
    setStops,
    loading,
    error,
    deliveryType,
    setDeliveryType,
    onBookingComplete,
}: Props) {
    const [vehicle, setVehicle] =
        useState("mini");

    const [
        selectedVehicle,
        setSelectedVehicle,
    ] = useState<string | null>(
        null
    );

    const [
        bookingStatus,
        setBookingStatus,
    ] = useState<BookingStatus>(
        "idle"
    );

    const hasRoute =
        pickup.trim().length > 1 &&
        drop.trim().length > 1;

    const selectedVehicleData =
        useMemo(
            () =>
                VEHICLES.find(
                    (item) =>
                        item.id === vehicle
                )!,
            [vehicle]
        );

    const selectedDeliveryType =
        useMemo(
            () =>
                DELIVERY_TYPES.find(
                    (item) =>
                        item.id ===
                        deliveryType
                )!,
            [deliveryType]
        );

    const finalPrice =
        selectedVehicleData.price +
        selectedDeliveryType.extra;

    useEffect(() => {
        if (!selectedVehicle) {
            return;
        }

        const handleEscape = (
            event: KeyboardEvent
        ) => {
            if (
                event.key === "Escape"
            ) {
                setSelectedVehicle(null);
            }
        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [selectedVehicle]);

    useEffect(() => {
        if (!hasRoute) {
            setSelectedVehicle(null);
        }
    }, [hasRoute]);

    const addStop = () => {
        if (
            stops.length >= MAX_STOPS
        ) {
            return;
        }

        setStops([
            ...stops,
            "",
        ]);
    };

    const updateStop = (
        index: number,
        value: string
    ) => {
        setStops((current) =>
            current.map(
                (stop, stopIndex) =>
                    stopIndex === index
                        ? value
                        : stop
            )
        );
    };

    const removeStop = (
        index: number
    ) => {
        setStops((current) =>
            current.filter(
                (_, stopIndex) =>
                    stopIndex !== index
            )
        );
    };

    const handleBooking = async () => {
        setBookingStatus(
            "searching"
        );

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    2500
                )
        );

        setBookingStatus(
            "driver-found"
        );

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    1200
                )
        );

        onBookingComplete();
    };

    return (
        <>
            <div className="p-5">
                {/* LOCATIONS */}
                <div className="rounded-2xl border border-[#263244] bg-[#141A1E] p-3">
                    <div className="flex gap-3">
                        <div className="flex w-6 flex-col items-center">
                            <Circle
                                className="mt-2 h-7 w-7 text-[#34D399]"
                                fill="currentColor"
                            />

                            <div className="h-full border-l border-dashed border-[#263244]" />

                            <MapPin
                                className="h-7 w-7 text-[#FF5C6C]"
                                fill="currentColor"
                            />
                        </div>

                        <div className="flex-1">
                            {/* Pickup */}
                            <input
                                value={pickup}
                                onChange={(event) =>
                                    setPickup(
                                        event.target.value
                                    )
                                }
                                placeholder="Pickup location"
                                className="w-full bg-[#141A1E] placeholder:text-md py-1 mb-2 text-md font-semibold text-[#F8FAFC] outline-none placeholder:text-[#94A3B8]"
                            />

                            {/* Stops */}
                            {stops.map(
                                (
                                    stop,
                                    index
                                ) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="flex items-center gap-2 border-t border-[#263244]"
                                    >
                                        <input
                                            value={
                                                stop
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateStop(
                                                    index,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder={`Stop ${
                                                index +
                                                1
                                            }`}
                                            className="w-full bg-[#141A1E] py-2  text-md font-semibold text-sm placeholder:text-md text-[#F8FAFC] outline-none placeholder:text-[#94A3B8]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeStop(
                                                    index
                                                )
                                            }
                                            className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#263244] hover:text-[#F8FAFC]"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                )
                            )}

                            {/* Destination */}
                            <div className="border-t border-[#263244]">
                                <input
                                    value={drop}
                                    onChange={(
                                        event
                                    ) =>
                                        setDrop(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Destination"
                                    className="w-full bg-transparent mt-3 text-md font-semibold text-[#F8FAFC] placeholder:text-md outline-none placeholder:text-[#94A3B8]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ADD STOP */}
                {hasRoute &&
                    stops.length <
                        MAX_STOPS && (
                        <button
                            type="button"
                            onClick={
                                addStop
                            }
                            className="mt-3 flex items-center gap-2 text-sm font-medium text-[#FF6B2C] hover:text-[#6BA0FF]"
                        >
                            <Plus size={16} />
                            Add stop
                        </button>
                    )}

                {/* VEHICLES */}
                {hasRoute && (
                    <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                            Vehicle
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                            {VEHICLES.map(
                                (item) => {
                                    const active =
                                        item.id ===
                                        vehicle;

                                    return (
                                        <button
                                            key={
                                                item.id
                                            }
                                            type="button"
                                            onClick={() => {
                                                setVehicle(
                                                    item.id
                                                );

                                                setSelectedVehicle(
                                                    item.id
                                                );
                                            }}
                                            className={`rounded-2xl border p-3 text-center transition-all ${
                                                active
                                                    ? "border-[#FF6B2C] bg-[#FF6B2C]/10"
                                                    : "border-[#263244] bg-[#111722] hover:border-[#4F8CFF]/50 hover:bg-[#161D29]"
                                            }`}
                                        >
                                            <item.icon
                                                className={`mx-auto h-6 w-6 ${
                                                    active
                                                        ? "text-[#FF6B2C]"
                                                        : "text-[#94A3B8]"
                                                }`}
                                            />

                                            <div className="mt-2 text-xs font-semibold text-[#F8FAFC]">
                                                {
                                                    item.label
                                                }
                                            </div>

                                            <div className="text-[11px] text-[#94A3B8]">
                                                ₹
                                                {
                                                    item.price
                                                }{" "}
                                                ·{" "}
                                                {
                                                    item.eta
                                                }
                                            </div>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>
                )}

                {/* SELECTED DELIVERY */}
                {hasRoute && (
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#263244] bg-[#141A1E] p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F8CFF]/10 text-[#4F8CFF]">
                                {(() => {
                                    const Icon =
                                        selectedDeliveryType.icon;

                                    return (
                                        <Icon size={19} className="text-[#FF6B2C]" />
                                    );
                                })()}
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#F8FAFC]">
                                    {
                                        selectedDeliveryType.label
                                    }
                                </p>

                                <p className="text-xs text-[#94A3B8]">
                                    {
                                        selectedDeliveryType.description
                                    }
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedVehicle(
                                    vehicle
                                )
                            }
                            className="text-xs font-semibold text-[#2CE0B8] hover:text-[#2CE0B8]/50"
                        >
                            Change
                        </button>
                    </div>
                )}

                {error && (
                    <p className="mt-3 text-sm text-[#EF4444]">
                        {error}
                    </p>
                )}

                {/* FIND ROUTE */}
                <button
                    type="submit"
                    disabled={
                        !hasRoute ||
                        loading
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4F8CFF] py-4 text-base font-bold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all enabled:hover:bg-[#6BA0FF] enabled:active:scale-[0.98] disabled:opacity-40"
                >
                    <Search size={19} />

                    {loading
                        ? "Finding route..."
                        : "Find Route"}
                </button>

                {/* BOOK */}
                {hasRoute &&
                    !loading && (
                        <button
                            type="button"
                            onClick={
                                handleBooking
                            }
                            disabled={
                                bookingStatus !==
                                "idle"
                            }
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B2C] py-4 text-base font-bold text-[#080B12] transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {bookingStatus ===
                            "searching" ? (
                                <>
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#080B12]/30 border-t-[#080B12]" />
                                    Finding a driver...
                                </>
                            ) : bookingStatus ===
                              "driver-found" ? (
                                <>
                                    <CheckCircle2
                                        size={
                                            19
                                        }
                                    />
                                    Driver found
                                </>
                            ) : (
                                <>
                                    <Truck
                                        size={
                                            19
                                        }
                                    />
                                    Book{" "}
                                    {
                                        selectedVehicleData.label
                                    }{" "}
                                    · ₹
                                    {
                                        finalPrice
                                    }
                                </>
                            )}
                        </button>
                    )}
            </div>

            {/* DRIVER SEARCH RESULT */}
            {bookingStatus !==
                "idle" && (
                <div className="border-t border-[#263244] p-5">
                    {bookingStatus ===
                    "searching" ? (
                        <div className="rounded-2xl border border-[#263244] bg-[#161D29] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4F8CFF]/10">
                                    <Search
                                        size={
                                            20
                                        }
                                        className="animate-pulse text-[#4F8CFF]"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-[#F8FAFC]">
                                        Finding a driver nearby...
                                    </p>

                                    <p className="mt-1 text-xs text-[#94A3B8]">
                                        Matching you with the best available driver
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#263244] bg-[#161D29] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34D399]/10 text-xl">
                                    👨🏻
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-[#F8FAFC]">
                                            {
                                                MOCK_DRIVER.name
                                            }
                                        </p>

                                        <span className="text-xs font-semibold text-[#FBBF24]">
                                            ★{" "}
                                            {
                                                MOCK_DRIVER.rating
                                            }
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-[#94A3B8]">
                                        {
                                            MOCK_DRIVER.vehicle
                                        }{" "}
                                        ·{" "}
                                        {
                                            MOCK_DRIVER.vehicleNumber
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-[#34D399]">
                                        Driver is coming to pickup
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* DELIVERY POPUP */}
            {selectedVehicle && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onMouseDown={() =>
                        setSelectedVehicle(
                            null
                        )
                    }
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-[#263244] bg-[#111722] p-5 shadow-2xl"
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                                    Delivery option
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-[#F8FAFC]">
                                    Choose delivery type
                                </h2>

                                <p className="mt-1 text-sm text-[#94A3B8]">
                                    {
                                        VEHICLES.find(
                                            (
                                                item
                                            ) =>
                                                item.id ===
                                                selectedVehicle
                                        )?.label
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedVehicle(
                                        null
                                    )
                                }
                                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#263244] hover:text-[#F8FAFC]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {DELIVERY_TYPES.map(
                                (type) => {
                                    const active =
                                        deliveryType ===
                                        type.id;

                                    const Icon =
                                        type.icon;

                                    const currentVehicle =
                                        VEHICLES.find(
                                            (
                                                item
                                            ) =>
                                                item.id ===
                                                selectedVehicle
                                        )!;

                                    const price =
                                        currentVehicle.price +
                                        type.extra;

                                    return (
                                        <button
                                            key={
                                                type.id
                                            }
                                            type="button"
                                            onClick={() => {
                                                setVehicle(
                                                    selectedVehicle
                                                );

                                                setDeliveryType(
                                                    type.id
                                                );

                                                setSelectedVehicle(
                                                    null
                                                );
                                            }}
                                            className={`rounded-2xl border p-4 text-left transition-all ${
                                                active
                                                    ? "border-[#4F8CFF] bg-[#4F8CFF]/10"
                                                    : "border-[#263244] bg-[#111722] hover:border-[#4F8CFF]/50 hover:bg-[#161D29]"
                                            }`}
                                        >
                                            <div
                                                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                                                    active
                                                        ? "bg-[#4F8CFF]/10 text-[#4F8CFF]"
                                                        : "bg-[#263244] text-[#94A3B8]"
                                                }`}
                                            >
                                                <Icon size={19} />
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-bold text-[#F8FAFC]">
                                                    {
                                                        type.label
                                                    }
                                                </span>

                                                <span className="text-sm font-bold text-[#F8FAFC]">
                                                    ₹
                                                    {
                                                        price
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                                                {
                                                    type.description
                                                }
                                            </p>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
