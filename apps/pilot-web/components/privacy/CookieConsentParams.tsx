"use client";

import { useEffect, useState } from "react";
import { isMobileApp } from "@/utils/environment";
import CookieBanner from "./CookieBanner";

const CONSENT_KEY = "leuniversita-cookie-consent";

export default function CookieConsentParams() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // 1. Check if we are in the Mobile App
        if (isMobileApp()) {
            setShowBanner(false);
            return;
        }

        // 2. Check if user has already made a choice
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, "accepted");
        setShowBanner(false);
        // Here actully enable analytics/pixels if any
    };

    const handleReject = () => {
        localStorage.setItem(CONSENT_KEY, "rejected");
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return <CookieBanner onAccept={handleAccept} onReject={handleReject} />;
}
