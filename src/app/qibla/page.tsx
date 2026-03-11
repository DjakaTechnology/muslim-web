"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  calculateQiblaBearing,
  calculateDistanceToMecca,
  formatDistance,
} from "~/lib/qibla";

const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;
const LOCATION_STORAGE_KEY = "qibla-last-location";

interface LocationState {
  lat: number;
  lng: number;
  accuracy: number | null;
  isDefault: boolean;
}

type CompassState = "loading" | "active" | "unavailable" | "ios-permission-needed";

function loadSavedLocation(): LocationState | null {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as LocationState;
  } catch { /* ignore */ }
  return null;
}

function saveLocation(loc: LocationState) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch { /* ignore */ }
}

export default function QiblaPage() {
  const [location, setLocation] = useState<LocationState>(() => {
    const saved = loadSavedLocation();
    if (saved) return saved;
    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG, accuracy: null, isDefault: true };
  });
  const [heading, setHeading] = useState<number | null>(null);
  const [compassState, setCompassState] = useState<CompassState>("loading");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [calibrationWarning, setCalibrationWarning] = useState(false);
  const headingRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);

  const qiblaBearing = calculateQiblaBearing(location.lat, location.lng);
  const distanceToMecca = calculateDistanceToMecca(location.lat, location.lng);

  // -- Location --
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationState = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isDefault: false,
        };
        setLocation(loc);
        saveLocation(loc);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === 1 ? "Location permission denied" : "Could not get location",
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // -- Compass --
  const startCompass = useCallback(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let h: number | null = null;
      const evt = e as unknown as Record<string, unknown>;

      if ("webkitCompassHeading" in e && typeof evt.webkitCompassHeading === "number") {
        h = Number(evt.webkitCompassHeading);
      } else if (e.alpha !== null) {
        h = (360 - (e.alpha ?? 0)) % 360;
      }

      if (h !== null) {
        headingRef.current = h;
        if ("webkitCompassAccuracy" in e && typeof evt.webkitCompassAccuracy === "number") {
          setCalibrationWarning(Number(evt.webkitCompassAccuracy) > 15);
        }
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    setCompassState("active");

    const animate = () => {
      if (headingRef.current !== null) {
        setHeading(headingRef.current);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const requestCompassPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission === "function") {
      try {
        const permission = await DOE.requestPermission();
        if (permission === "granted") {
          startCompass();
        } else {
          setCompassState("unavailable");
        }
      } catch {
        setCompassState("unavailable");
      }
    }
  }, [startCompass]);

  useEffect(() => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DOE.requestPermission === "function") {
      setCompassState("ios-permission-needed");
    } else if ("DeviceOrientationEvent" in window) {
      const cleanup = startCompass();
      const timeout = setTimeout(() => {
        if (headingRef.current === null) {
          setCompassState("unavailable");
        }
      }, 1500);
      return () => {
        cleanup();
        clearTimeout(timeout);
      };
    } else {
      setCompassState("unavailable");
    }
  }, [startCompass]);

  // The rotation that makes the Kaaba point to the top when phone faces Qibla
  const rotation = heading !== null ? qiblaBearing - heading : 0;
  // When rotation is ~0 (±15°), phone is pointing toward Qibla
  const isAligned = heading !== null && Math.abs(((rotation % 360) + 540) % 360 - 180) > 165;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 pb-24">
      {/* Instruction */}
      <p className="mb-8 text-center text-sm text-muted-foreground">
        {compassState === "active"
          ? "Point the top of your phone toward the Kaaba"
          : "Showing Qibla direction"}
      </p>

      {/* Arrow pointing up — this is where you aim */}
      <div className="mb-4">
        <svg width="24" height="32" viewBox="0 0 24 32" className={`transition-colors duration-300 ${isAligned ? "text-primary" : "text-muted-foreground"}`}>
          <path d="M12 0L2 16h8v16h4V16h8L12 0z" fill="currentColor" />
        </svg>
      </div>

      {/* Compass circle */}
      <div className="relative mb-8">
        <div
          className="relative flex size-72 items-center justify-center rounded-full border-2 border-border transition-transform duration-100 ease-out sm:size-80"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Kaaba icon at top (0°) */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <div className={`flex size-10 items-center justify-center rounded-xl shadow-lg transition-colors duration-300 ${isAligned ? "bg-primary text-primary-foreground" : "bg-card text-primary border border-border"}`}>
              <KaabaIcon className="size-6" />
            </div>
          </div>

          {/* Subtle compass ring markers */}
          {Array.from({ length: 72 }, (_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-0 -translate-x-1/2 origin-[center_144px] sm:origin-[center_160px]"
              style={{ transform: `rotate(${i * 5}deg)` }}
            >
              <div className={i % 18 === 0 ? "h-3 w-0.5 bg-muted-foreground/60" : i % 6 === 0 ? "h-2 w-px bg-muted-foreground/40" : "h-1 w-px bg-muted-foreground/20"} />
            </div>
          ))}

          {/* N marker */}
          <div className="absolute left-1/2 top-5 -translate-x-1/2 text-xs font-bold text-red-500"
            style={{ transform: `rotate(${-rotation}deg)` }}>
          </div>

          {/* Center dot */}
          <div className={`size-3 rounded-full transition-colors duration-300 ${isAligned ? "bg-primary" : "bg-muted-foreground/30"}`} />
        </div>
      </div>

      {/* Distance */}
      <p className="mb-1 text-lg font-semibold">
        {formatDistance(distanceToMecca)}
      </p>
      <p className="mb-6 text-xs text-muted-foreground">to Mecca</p>

      {/* Status messages */}
      {compassState === "ios-permission-needed" && (
        <Button onClick={requestCompassPermission} className="mb-4">
          Enable Compass
        </Button>
      )}

      {compassState === "unavailable" && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Compass not available on this device</span>
        </div>
      )}

      {calibrationWarning && compassState === "active" && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-orange-500/10 px-4 py-2 text-sm text-orange-600 dark:text-orange-400">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Wave your phone in a figure-8 to calibrate</span>
        </div>
      )}

      {/* Location button */}
      <Button
        variant={location.isDefault ? "default" : "outline"}
        size="lg"
        className="w-full max-w-xs gap-2"
        onClick={requestLocation}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <>
            <Spinner />
            Getting location…
          </>
        ) : location.isDefault ? (
          <>
            <MapPin className="size-4" />
            Use My Location
          </>
        ) : (
          <>
            <LocateFixed className="size-4" />
            Location Active
          </>
        )}
      </Button>

      {locationError && (
        <p className="mt-2 text-center text-sm text-destructive">{locationError}</p>
      )}

      {location.isDefault && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Using default location (Jakarta)
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function KaabaIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.38 7.5 12 10.82 5.62 7.5 12 4.18zM5 8.82l6 3.33v7.03l-6-3.33V8.82zm8 10.36v-7.03l6-3.33v7.03l-6 3.33z" />
    </svg>
  );
}
