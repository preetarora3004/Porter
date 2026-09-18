"use client";

import {
    ArrowRight,
    Check,
    ChevronRight,
    Clock3,
    IndianRupee,
    Menu,
    PackageCheck,
    Route as RouteIcon,
    ShieldCheck,
    Sparkles,
    X,
    Zap,
} from "lucide-react";

import { useState } from "react";

import heroImage from "../../public/heroImage.jpg";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const services = [
    {
        icon: IndianRupee,
        name: "Lite",
        text: "The most cost-effective route for standard, non-urgent shipments.",
        tag: "Lowest cost",
    },
    {
        icon: ShieldCheck,
        name: "Fragile Friendly",
        text: "Special handling for sensitive items, balanced with cost efficiency.",
        tag: "Handled with care",
    },
    {
        icon: Zap,
        name: "Fastest",
        text: "Express delivery when every hour matters to you and your customer.",
        tag: "Time critical",
    },
    {
        icon: PackageCheck,
        name: "Premium",
        text: "The safest and quickest option for high-value, delicate items.",
        tag: "Fragile + fast",
    },
];

const plans = [
    {
        name: "Starter",
        price: "Free",
        features: [
            "Live courier comparison",
            "Automatic best-fit matching",
            "SMS & WhatsApp updates",
        ],
    },
    {
        name: "Accelerate",
        price: "₹1,899",
        suffix: "/ month",
        fee: "10% Discount on every shipping",
        featured: true,
        features: [
            "AI-built selling website",
            "Ordering & returns management",
            "Seller analytics dashboard",
            "Weight dispute photo proof",
        ],
    },
    {
        name: "Signature",
        price: "₹3,399",
        suffix: "/ month",
        fee: "15% Discount on every order",
        features: [
            "One-to-one website build",
            "Advanced customisation",
            "COD reconciliation",
            "Priority peak-season allocation",
        ],
    },
];

const deliveryPlans = [
    {
        name: "Delivery Lite",
        price: "₹499",
        suffix: "/month",
        fee: "100 orders free of processing charges then 15% Discount",
        features: [
            "Up to 100 free orders every month",
            "15% Discount on additional orders",
            "Essential delivery management",
        ],
    },
    {
        name: "Delivery Pro",
        price: "₹799",
        suffix: "/ month",
        fee: "200 orders free of processing charges then 20% Discount",
        featured: true,
        features: [
            "Up to 200 free orders every month",
            "20% discount on additional orders",
            "Advance delivery management",
            "Seller analytics & insights",
        ],
    },
];

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [quoteReady, setQuoteReady] = useState(false);

    const router = useRouter();

    const closeMenu = () => setMenuOpen(false);

    return (
        <main className="min-h-screen overflow-hidden bg-background text-foreground">
            {/* =========================================================
          NAVBAR
      ========================================================= */}
            <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#05090b]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                    {/* Logo */}
                    <a
                        href="#top"
                        className="font-display text-2xl font-bold text-white"
                        aria-label="Mark-IT home"
                    >
                        Mark
                        <span className="text-accent-strong">-IT.</span>
                    </a>

                    {/* Desktop Navigation */}
                    <nav
                        className="hidden items-center gap-8 text-sm text-white/60 md:flex"
                        aria-label="Main navigation"
                    >
                        <a className="transition-colors hover:text-white" href="#how">
                            How it works
                        </a>

                        <a className="transition-colors hover:text-white" href="#services">
                            Services
                        </a>

                        <a className="transition-colors hover:text-white" href="#pricing">
                            Pricing
                        </a>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden items-center gap-3 md:flex">
                        <Button
                            asChild
                            variant="ghost"
                            className="text-white hover:bg-white/10 hover:text-white"
                        >
                            <a href="#pricing">View plans</a>
                        </Button>

                        <Button
                            onClick={() => router.push("/map")}
                            asChild
                            className="h-11 bg-[#FC6D00] px-5 text-accent-strong-foreground hover:bg-accent-strong/90"
                        >
                            <a href="/map">
                                Start shipping
                                <ArrowRight />
                            </a>
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 hover:text-white md:hidden"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X /> : <Menu />}
                    </Button>
                </div>

                {/* Mobile Navigation */}
                {menuOpen && (
                    <nav
                        className="border-t border-white/10 bg-[#05090b] px-5 py-5 md:hidden"
                        aria-label="Mobile navigation"
                    >
                        <div className="flex flex-col gap-4 text-sm text-white">
                            <a onClick={closeMenu} href="#how">
                                How it works
                            </a>

                            <a onClick={closeMenu} href="#services">
                                Services
                            </a>

                            <a onClick={closeMenu} href="#pricing">
                                Pricing
                            </a>

                            <Button
                                asChild
                                className="mt-2 bg-accent-strong text-accent-strong-foreground hover:bg-accent-strong/90"
                            >
                                <a onClick={closeMenu} href="#quote">
                                    Start shipping
                                </a>
                            </Button>
                        </div>
                    </nav>
                )}
            </header>

            {/* =========================================================
          HERO
      ========================================================= */}
            <section
                id="top"
                className="relative flex min-h-[94svh] items-end bg-[#05090b] pt-20 text-white"
            >
                <img
                    src={heroImage.src}
                    alt="Delivery van carrying parcels through New Delhi"
                    width={1920}
                    height={1080}
                    className="absolute inset-0 h-full w-full object-cover object-[64%_center]"
                />

                <div className="hero-shade absolute inset-0" />

                <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-28 lg:px-8 lg:pb-24 lg:pt-40">
                    <div className="max-w-3xl">
                        {/* Kicker */}
                        <div className="mb-7 inline-flex items-center gap-2 border border-accent-strong/50 bg-accent-strong/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent-strong backdrop-blur-sm">
                            <Sparkles className="size-4" />
                            India’s multi-leg shipment orchestrator
                        </div>

                        {/* Heading */}
                        <h1 className="font-display max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl">
                            <span className="text-white">Har route.</span>

                            <br />

                            <span className="text-accent-strong">Sabse smart.</span>
                        </h1>

                        {/* Description */}
                        <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                            Every courier, surface carrier and local transporter—stitched into
                            one booking, one price and one tracking link.
                        </p>

                        {/* CTA */}
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 bg-accent-strong px-6 text-base text-accent-strong-foreground hover:bg-accent-strong/90"
                            >
                                <a href="#quote">
                                    Compare my route
                                    <ArrowRight />
                                </a>
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-12 border-white/30 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
                            >
                                <a href="#how">See how it works</a>
                            </Button>
                        </div>

                        {/* Benefits */}
                        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-white/70">
                            <span className="flex items-center gap-2">
                                <Check className="size-4 text-success" />
                                No fixed cost
                            </span>

                            <span className="flex items-center gap-2">
                                <Check className="size-4 text-success" />
                                No website needed
                            </span>

                            <span className="flex items-center gap-2">
                                <Check className="size-4 text-success" />
                                One live dashboard
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          STATS
      ========================================================= */}
            <section className="border-y border-white/10 p-1 bg-surface text-white">
            </section>

            {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
            <section id="how" className="bg-[#03080A] py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
                        <div>
                            <p className="section-kicker">One seamless journey</p>

                            <h2 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
                                From order to doorstep, automatically.
                            </h2>

                            <p className="mt-6 max-w-md leading-7 text-muted-foreground">
                                Mark-IT reads what each shipment needs, compares every available
                                route, then handles booking and updates in one place.
                            </p>
                        </div>

                        <ol className="border-t border-border">
                            {[
                                [
                                    "01",
                                    "Connect",
                                    "Onboard through the Mark-IT app or website.",
                                ],
                                [
                                    "02",
                                    "Tell us what matters",
                                    "Speed, fragility, budget and destination shape the route.",
                                ],
                                [
                                    "03",
                                    "AI compares live options",
                                    "Rates, delivery time and serviceability are checked together.",
                                ],
                                [
                                    "04",
                                    "Ship & track",
                                    "The best-fit courier is booked and updated automatically.",
                                ],
                            ].map(([number, title, text]) => (
                                <li
                                    key={number}
                                    className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border py-7"
                                >
                                    <span className="font-mono text-xs text-accent-strong">
                                        {number}
                                    </span>

                                    <div>
                                        <h3 className="font-display text-lg font-semibold">
                                            {title}
                                        </h3>

                                        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                                    </div>

                                    <ChevronRight className="size-5 text-muted-foreground" />
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* =========================================================
          SERVICES
      ========================================================= */}
            <section
                id="services"
                className="border-y border-white/10 bg-surface py-24 text-white sm:py-32"
            >
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="section-kicker">Built around the package</p>

                            <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
                                Four ways to move.
                            </h2>
                        </div>

                        <p className="max-w-md text-sm leading-6 text-white/60">
                            Choose the outcome. Mark-IT finds the route.
                        </p>
                    </div>

                    <div className="mt-14 grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
                        {services.map(({ icon: Icon, name, text, tag }) => (
                            <article
                                key={name}
                                className="group min-h-80 border-b border-r border-white/10 bg-[#0d1417] p-7 transition-colors hover:bg-white/5"
                            >
                                <Icon className="size-7 text-accent-strong" strokeWidth={1.7} />

                                <p className="mt-20 font-mono text-[11px] uppercase text-accent-strong">
                                    {tag}
                                </p>

                                <h3 className="font-display mt-3 text-2xl font-semibold text-white">
                                    {name}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
          QUOTE
      ========================================================= */}
            <section
                id="quote"
                className="relative overflow-hidden bg-accent-strong py-24 text-accent-strong-foreground sm:py-32"
            >
                <div className="route-lines absolute inset-0 opacity-30" />

                <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
                    <div>
                        <p className="text-xs font-bold uppercase">Ready when you are</p>

                        <h2 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-6xl">
                            Your next shipment deserves a smarter route.
                        </h2>
                    </div>

                    <div className="border border-accent-panel-border bg-accent-panel p-5 shadow-2xl sm:p-7">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-xs font-semibold">
                                Pickup location
                                <input
                                    className="mt-2 h-12 w-full border border-accent-panel-border bg-accent-input px-4 text-sm text-white outline-none placeholder:text-accent-placeholder focus:border-accent-strong"
                                    placeholder="e.g. Karol Bagh"
                                />
                            </label>

                            <label className="text-xs font-semibold">
                                Destination
                                <input
                                    className="mt-2 h-12 w-full border border-accent-panel-border bg-accent-input px-4 text-sm text-white outline-none placeholder:text-accent-placeholder focus:border-accent-strong"
                                    placeholder="Enter city or PIN code"
                                />
                            </label>
                        </div>

                        <Button
                            onClick={() => setQuoteReady(true)}
                            className="mt-4 h-12 w-full bg-accent-button text-accent-button-foreground hover:bg-accent-button-hover"
                        >
                            <RouteIcon />
                            Find my smartest route
                        </Button>

                        {quoteReady && (
                            <p className="mt-4 flex items-center gap-2 text-sm">
                                <Check className="size-4" />
                                Route request ready—enter both locations to continue.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* =========================================================
          PRICING
      ========================================================= */}
            <section id="pricing" className="bg-[#03080A] py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="section-kicker">Simple pricing</p>

                        <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
                            Start light. Scale smart.
                        </h2>

                        <p className="mt-5 text-muted-foreground">
                            No heavy fixed-cost commitment. Pick the support your business
                            needs today.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-5 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <article
                                key={plan.name}
                                className={`relative border p-7 sm:p-8 ${plan.featured
                                        ? "border-accent-strong bg-[#091116] shadow-highlight"
                                        : "border-[#253034] bg-[#091116]"
                                    }`}
                            >
                                {plan.featured && (
                                    <span className="absolute right-5 top-5 bg-accent-strong px-2 py-1 text-[10px] font-bold uppercase text-accent-strong-foreground">
                                        Most popular
                                    </span>
                                )}

                                <p className="text-sm font-semibold">Mark-IT {plan.name}</p>

                                <div className="mt-7 flex items-end gap-2">
                                    <span className="font-display text-4xl font-bold">
                                        {plan.price}
                                    </span>

                                    {plan.suffix && (
                                        <span className="pb-1 text-sm text-muted-foreground">
                                            {plan.suffix}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-3 min-h-10 text-xs text-muted-foreground">
                                    {plan.fee}
                                </p>

                                <Button
                                    asChild
                                    variant={plan.featured ? "default" : "outline"}
                                    className={`mt-7 h-11 w-full ${plan.featured
                                            ? "bg-accent-strong text-accent-strong-foreground hover:bg-accent-strong/90"
                                            : "bg-[#03080A] border-[#253034]"
                                        }`}
                                >
                                    <a href="#quote">Choose {plan.name}</a>
                                </Button>

                                <ul className="mt-8 space-y-4 border-t border-[#253034] pt-7">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex gap-3 text-sm">
                                            <Check className="mt-0.5 size-4 shrink-0 text-success" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section
                id="quote"
                className="relative overflow-hidden bg-accent-strong py-1 text-accent-strong-foreground sm:py-1"
            >
                <div className="route-lines absolute inset-0 opacity-30" />
            </section>

            <section id="pricing" className="bg-[#03080A] py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="section-kicker">Plan for every stage</p>

                        <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
                            Grow without limits.
                        </h2>

                        <p className="mt-5 text-muted-foreground">
                            Start free and upgrade whenever you are ready. Only pay what you need.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-5 lg:grid-cols-2">
                        {deliveryPlans.map((plan) => (
                            <article
                                key={plan.name}
                                className={`relative border p-7 sm:p-8 ${plan.featured
                                        ? "border-accent-strong bg-[#091116] shadow-highlight"
                                        : "border-[#253034] bg-[#091116]"
                                    }`}
                            >
                                {plan.featured && (
                                    <span className="absolute right-5 top-5 bg-accent-strong px-2 py-1 text-[10px] font-bold uppercase text-accent-strong-foreground">
                                        Most popular
                                    </span>
                                )}

                                <p className="text-sm font-semibold">Mark-IT {plan.name}</p>

                                <div className="mt-7 flex items-end gap-2">
                                    <span className="font-display text-4xl font-bold">
                                        {plan.price}
                                    </span>

                                    {plan.suffix && (
                                        <span className="pb-1 text-sm text-muted-foreground">
                                            {plan.suffix}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-3 min-h-10 text-xs text-muted-foreground">
                                    {plan.fee}
                                </p>

                                <Button
                                    asChild
                                    variant={plan.featured ? "default" : "outline"}
                                    className={`mt-7 h-11 w-full ${plan.featured
                                            ? "bg-accent-strong text-accent-strong-foreground hover:bg-accent-strong/90"
                                            : "bg-[#03080A] border-[#253034]"
                                        }`}
                                >
                                    <a href="#quote">Choose {plan.name}</a>
                                </Button>

                                <ul className="mt-8 space-y-4 border-t border-[#253034] pt-7">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex gap-3 text-sm">
                                            <Check className="mt-0.5 size-4 shrink-0 text-success" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </div>
            </section>


            {/* =========================================================
          FOOTER
      ========================================================= */}
            <footer className="border-t border-white/10 bg-surface text-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <div>
                        <div className="font-display text-xl font-bold">
                            Mark
                            <span className="text-accent-strong">-IT</span>.
                        </div>

                        <p className="mt-2 text-xs text-white/50">
                            Your baniya of e-commerce.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <Clock3 className="size-4 text-accent-strong" />
                        Built for India’s small sellers
                    </div>

                    <p className="text-xs text-white/50">
                        © 2026 Mark-IT. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    );
}
