"use client";

import { useEffect, useRef, useCallback } from "react";

const STYLE_URL =
  "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json";

// Default center: Bangalore
const DEFAULT_CENTER: [number, number] = [77.5946, 12.9716]; // [lng, lat]
const DEFAULT_ZOOM = 13;

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;      // popup text
  price?: string;      // shown on pin bubble
  color?: string;
}

/** Build a GeoJSON polygon approximating a circle of `radiusMeters` around [lng, lat]. */
function buildCircleGeoJSON(lng: number, lat: number, radiusMeters: number, points = 64) {
  const latRad = (lat * Math.PI) / 180;
  const mPerLat = 111320;
  const mPerLng = 111320 * Math.cos(latRad);
  const coords: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    coords.push([
      lng + (radiusMeters / mPerLng) * Math.cos(angle),
      lat + (radiusMeters / mPerLat) * Math.sin(angle),
    ]);
  }
  coords.push(coords[0]);
  return {
    type: "FeatureCollection" as const,
    features: [{
      type: "Feature" as const,
      geometry: { type: "Polygon" as const, coordinates: [coords] },
      properties: {},
    }],
  };
}

interface OlaMapProps {
  /** [lng, lat] */
  center?: [number, number];
  zoom?: number;
  /** Static markers (e.g. search result pins) */
  markers?: MapMarker[];
  /** If true, renders one draggable pin at `center` */
  draggablePin?: boolean;
  /** Called when draggable pin is moved or map is clicked in pin-drop mode */
  onPinDrop?: (lat: number, lng: number) => void;
  /**
   * If true, shows a 100 m radius semi-transparent circle around `center`
   * instead of an exact marker pin. Use on property detail pages to protect
   * the precise address while still indicating the neighbourhood.
   */
  locationCircle?: boolean;
  /**
   * If true, renders each entry in `markers` as a 100 m radius circle instead
   * of a pin. Use on search/listing maps to show approximate areas.
   */
  circleMarkers?: boolean;
  height?: string | number;
  className?: string;
}

export function OlaMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  draggablePin = false,
  onPinDrop,
  locationCircle = false,
  circleMarkers = false,
  height = 320,
  className,
}: OlaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY ?? "";

  const handleDragEnd = useCallback(
    (lngLat: { lat: number; lng: number }) => {
      onPinDrop?.(lngLat.lat, lngLat.lng);
    },
    [onPinDrop]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!apiKey) {
      console.warn("[OlaMap] NEXT_PUBLIC_OLA_MAPS_API_KEY is not set");
      return;
    }

    let cancelled = false;

    (async () => {
      // Dynamically import to avoid SSR issues
      const { OlaMaps } = await import("olamaps-web-sdk");

      if (cancelled || !containerRef.current) return;

      const olaMaps = new OlaMaps({ apiKey });

      const map = await olaMaps.init({
        style: `${STYLE_URL}?api_key=${apiKey}`,
        container: containerRef.current,
        center,
        zoom,
      });

      mapRef.current = map;

      // Suppress known OlaMaps style-bundle issues (missing source layer / sprite)
      map.on("error", (e: any) => {
        const msg: string = e?.error?.message ?? "";
        if (msg.includes("does not exist on source") || msg.includes("3d_model")) return;
        console.error("[OlaMap]", msg || e);
      });

      // Provide a 1×1 transparent fallback for any missing sprite image (e.g. "ola-mbo")
      map.on("styleimagemissing", (e: any) => {
        if (map.hasImage(e.id)) return;
        const blank = new ImageData(new Uint8ClampedArray(4), 1, 1);
        map.addImage(e.id, blank);
      });

      // ── Draggable pin ────────────────────────────────────────────────────
      if (draggablePin && !locationCircle) {
        const pin = olaMaps
          .addMarker({ color: "#0D7C66", draggable: true, anchor: "bottom" })
          .setLngLat(center)
          .addTo(map);

        pinRef.current = pin;

        pin.on("dragend", () => {
          const pos = pin.getLngLat();
          handleDragEnd({ lat: pos.lat, lng: pos.lng });
        });

        // Also allow click-to-move on the map
        map.on("click", (e: any) => {
          const { lat, lng } = e.lngLat;
          pin.setLngLat([lng, lat]);
          handleDragEnd({ lat, lng });
        });
      }

      // ── 100 m location circle (privacy mode) ────────────────────────────
      if (locationCircle) {
        const addCircle = () => {
          const geoJSON = buildCircleGeoJSON(center[0], center[1], 100);
          map.addSource("location-circle", { type: "geojson", data: geoJSON });
          map.addLayer({
            id: "location-circle-fill",
            type: "fill",
            source: "location-circle",
            paint: { "fill-color": "#0D7C66", "fill-opacity": 0.15 },
          });
          map.addLayer({
            id: "location-circle-outline",
            type: "line",
            source: "location-circle",
            paint: { "line-color": "#0D7C66", "line-width": 2, "line-opacity": 0.55 },
          });
        };
        if (map.loaded()) {
          addCircle();
        } else {
          map.on("load", addCircle);
        }
      }

      // ── Per-marker 100 m circles (search map privacy mode) ──────────────
      if (circleMarkers && markers.length > 0) {
        const addCircles = () => {
          markers.forEach((m, i) => {
            const geoJSON = buildCircleGeoJSON(m.lng, m.lat, 100);
            map.addSource(`circle-src-${i}`, { type: "geojson", data: geoJSON });
            map.addLayer({
              id: `circle-fill-${i}`,
              type: "fill",
              source: `circle-src-${i}`,
              paint: { "fill-color": m.color ?? "#0D7C66", "fill-opacity": 0.18 },
            });
            map.addLayer({
              id: `circle-outline-${i}`,
              type: "line",
              source: `circle-src-${i}`,
              paint: { "line-color": m.color ?? "#0D7C66", "line-width": 2, "line-opacity": 0.6 },
            });
          });
        };
        if (map.loaded()) {
          addCircles();
        } else {
          map.on("load", addCircles);
        }
      }

      // ── Static markers ───────────────────────────────────────────────────
      if (!locationCircle && !circleMarkers) {
        markers.forEach((m) => {
          const marker = olaMaps
            .addMarker({ color: m.color ?? "#0D7C66", anchor: "bottom" })
            .setLngLat([m.lng, m.lat])
            .addTo(map);

          if (m.label || m.price) {
            const popup = olaMaps
              .addPopup({ offset: [0, -36], closeButton: false })
              .setHTML(
                m.price
                  ? `<div style="font-weight:700;font-size:13px;color:#0D7C66">${m.price}</div>${m.label ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${m.label}</div>` : ""}`
                  : `<div style="font-size:12px">${m.label}</div>`
              );
            marker.setPopup(popup);
            marker.togglePopup();
          }
        });
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove?.();
        mapRef.current = null;
        pinRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Update pin position when center prop changes externally
  useEffect(() => {
    if (pinRef.current && draggablePin) {
      pinRef.current.setLngLat(center);
      mapRef.current?.flyTo?.({ center, zoom, duration: 600 });
    }
  }, [center, draggablePin, zoom]);

  // No API key — render a static placeholder so the rest of the UI doesn't break
  if (!apiKey) {
    return (
      <div
        className={className}
        style={{
          height,
          width: "100%",
          borderRadius: "var(--r-md, 10px)",
          overflow: "hidden",
          background: "#e8ede9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "#9ca3af",
          fontSize: 13,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <span>Map preview — add Ola Maps key to enable</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        width: "100%",
        borderRadius: "var(--r-md, 10px)",
        overflow: "hidden",
        background: "#e8ede9",
        position: "relative",
      }}
    />
  );
}
