"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Navigation, LocateFixed, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  calculateQiblaBearing,
  calculateDistanceToMecca,
  formatBearing,
  formatDistance,
} from "~/lib/qibla";

// Default fallback: Jakarta
const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;
const LOCATION_STORAGE_KEY = "qibla-last-location";

interface LocationState {
  lat: number;
  lng: number;
  accuracy: number | null;
  isDefault: boolean;
}

type CompassState =
  | "loading"
  | "active"
  | "unavailable"
  | "ios-permission-needed";

function loadSavedLocation(): LocationState | null {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as LocationState;
  } catch {
    /* ignore */
  }
  return null;
}

function saveLocation(loc: LocationState) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch {
    /* ignore */
  }
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
          err.code === 1
            ? "Location permission denied"
            : "Could not get location",
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // -- Compass / DeviceOrientation --
  const startCompass = useCallback(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let h: number | null = null;

      // iOS provides webkitCompassHeading
      const evt = e as unknown as Record<string, unknown>;
      if (
        "webkitCompassHeading" in e &&
        typeof evt.webkitCompassHeading === "number"
      ) {
        h = Number(evt.webkitCompassHeading);
      } else if (e.alpha !== null) {
        // Android: alpha is degrees from North (when absolute) or arbitrary
        // For absolute orientation, heading = 360 - alpha
        h = (360 - (e.alpha ?? 0)) % 360;
      }

      if (h !== null) {
        headingRef.current = h;

        // Detect unreliable magnetometer (accuracy > 15° on supported browsers)
        if (
          "webkitCompassAccuracy" in e &&
          typeof evt.webkitCompassAccuracy === "number"
        ) {
          setCalibrationWarning(
            Number(evt.webkitCompassAccuracy) > 15,
          );
        }
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    setCompassState("active");

    // Smooth animation loop
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
    // iOS 13+ requires explicit permission
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
    // Check if DeviceOrientationEvent is available
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DOE.requestPermission === "function") {
      // iOS - needs user gesture to request permission
      setCompassState("ios-permission-needed");
    } else if ("DeviceOrientationEvent" in window) {
      // Android / desktop - try to start directly
      const cleanup = startCompass();

      // If no heading received after 1.5s, mark as unavailable
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

  // Compass rotation: rotate the dial so North points to actual North
  const compassRotation = heading !== null ? -heading : 0;
  // Qibla arrow rotation relative to the compass dial
  const qiblaOnCompass = qiblaBearing;

  return (
    <div className="flex min-h-svh flex-col items-center px-4 pb-24 pt-8">
      {/* Title */}
      <h1 className="mb-1 text-xl font-bold">Qibla Compass</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Direction to the Kaaba, Mecca
      </p>

      {/* Bearing display */}
      <div className="mb-4 text-center">
        <p className="text-3xl font-bold text-primary">
          {formatBearing(qiblaBearing)}
        </p>
        <p className="text-xs text-muted-foreground">Qibla bearing</p>
      </div>

      {/* Compass */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer ring */}
        <div className="relative size-72 rounded-full border-2 border-border sm:size-80">
          {/* Compass dial - rotates with device heading */}
          <div
            className="absolute inset-0 transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            {/* Cardinal directions */}
            {(["N", "E", "S", "W"] as const).map((dir, i) => {
              const angle = i * 90;
              return (
                <div
                  key={dir}
                  className="absolute left-1/2 top-0 -translate-x-1/2 origin-[center_calc(theme(size.72)/2)] sm:origin-[center_calc(theme(size.80)/2)]"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className={cn(
                      "block pt-2 text-center text-sm font-bold",
                      dir === "N" ? "text-red-500" : "text-muted-foreground",
                    )}
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {dir}
                  </span>
                </div>
              );
            })}

            {/* Tick marks */}
            {Array.from({ length: 36 }, (_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-0 -translate-x-1/2 origin-[center_calc(theme(size.72)/2)] sm:origin-[center_calc(theme(size.80)/2)]"
                style={{ transform: `rotate(${i * 10}deg)` }}
              >
                <div
                  className={cn(
                    "mx-auto",
                    i % 9 === 0
                      ? "h-3 w-0.5 bg-foreground"
                      : "h-2 w-px bg-muted-foreground/50",
                  )}
                />
              </div>
            ))}

            {/* Qibla indicator on the dial */}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 origin-[center_calc(theme(size.72)/2)] sm:origin-[center_calc(theme(size.80)/2)]"
              style={{ transform: `rotate(${qiblaOnCompass}deg)` }}
            >
              <div className="flex flex-col items-center">
                {/* Kaaba icon */}
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md">
                  <KaabaIcon className="size-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Center point - stays fixed */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/30">
              <Navigation
                className="size-8 text-primary"
                style={{
                  transform:
                    heading !== null
                      ? `rotate(${qiblaBearing - heading}deg)`
                      : `rotate(${qiblaBearing}deg)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compass state messages */}
      {compassState === "ios-permission-needed" && (
        <Button onClick={requestCompassPermission} className="mb-4">
          Enable Compass
        </Button>
      )}

      {compassState === "unavailable" && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Compass not available — showing static direction</span>
        </div>
      )}

      {calibrationWarning && compassState === "active" && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-orange-500/10 px-4 py-2 text-sm text-orange-600 dark:text-orange-400">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Low accuracy — wave your device in a figure-8 to calibrate</span>
        </div>
      )}

      {/* Info cards */}
      <div className="w-full max-w-sm space-y-3">
        {/* Location button */}
        <Button
          variant={location.isDefault ? "default" : "outline"}
          size="lg"
          className="w-full gap-2"
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
          <p className="text-center text-sm text-destructive">{locationError}</p>
        )}

        {location.isDefault && (
          <p className="text-center text-xs text-muted-foreground">
            Using default location (Jakarta)
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            label="Distance to Mecca"
            value={formatDistance(distanceToMecca)}
          />
          <InfoCard
            label="Bearing"
            value={`${Math.round(qiblaBearing)}°`}
          />
          <InfoCard
            label="Coordinates"
            value={`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
          />
          <InfoCard
            label={location.accuracy !== null ? "Accuracy" : "Compass"}
            value={
              location.accuracy !== null
                ? `±${Math.round(location.accuracy)} m`
                : compassState === "active"
                  ? "Active"
                  : "Static"
            }
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function KaabaIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.38 7.5 12 10.82 5.62 7.5 12 4.18zM5 8.82l6 3.33v7.03l-6-3.33V8.82zm8 10.36v-7.03l6-3.33v7.03l-6 3.33z" />
    </svg>
  );
}
