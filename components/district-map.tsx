"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";

interface DistrictMapProps {
  onSelectDistrict: (district: 13 | 17) => void;
}

const districtGeoJson: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { district: 13, label: "13 участок" },
      geometry: {
        type: "Polygon",
        coordinates: [[[69.119, 54.874], [69.151, 54.874], [69.155, 54.892], [69.123, 54.896], [69.119, 54.874]]],
      },
    },
    {
      type: "Feature",
      properties: { district: 17, label: "17 участок" },
      geometry: {
        type: "Polygon",
        coordinates: [[[69.151, 54.858], [69.187, 54.859], [69.185, 54.884], [69.155, 54.892], [69.151, 54.858]]],
      },
    },
  ],
};

const buildingGeoJson: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    [69.128, 54.882, 13], [69.135, 54.888, 13], [69.143, 54.881, 13], [69.127, 54.891, 13], [69.148, 54.887, 13],
    [69.160, 54.866, 17], [69.171, 54.866, 17], [69.180, 54.869, 17], [69.158, 54.876, 17], [69.170, 54.877, 17],
    [69.180, 54.878, 17], [69.160, 54.884, 17], [69.175, 54.883, 17],
  ].map(([longitude, latitude, district], index) => ({
    type: "Feature",
    properties: { id: index + 1, district },
    geometry: { type: "Point", coordinates: [longitude, latitude] },
  })) as GeoJSON.Feature[],
};

export function DistrictMap({ onSelectDistrict }: DistrictMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;
    void import("maplibre-gl").then((maplibregl) => {
      if (disposed || !containerRef.current) return;
      // Turbopack rewrites import.meta.url inside MapLibre's bundle, so its
      // inferred sibling worker URL does not exist. Serve the matching worker
      // from /public and configure it before the first map is constructed.
      maplibregl.setWorkerUrl("/maplibre-gl-worker-6.17.0.mjs");
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [69.154, 54.88],
        zoom: 12.6,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.on("load", () => {
        map.addSource("districts", { type: "geojson", data: districtGeoJson });
        map.addLayer({
          id: "district-fill",
          type: "fill",
          source: "districts",
          paint: {
            "fill-color": ["match", ["get", "district"], 13, "#4F7DFF", 17, "#EC4899", "#64748B"],
            "fill-opacity": 0.2,
          },
        });
        map.addLayer({
          id: "district-line",
          type: "line",
          source: "districts",
          paint: {
            "line-color": ["match", ["get", "district"], 13, "#2F5FE6", 17, "#DB2777", "#64748B"],
            "line-width": 3,
          },
        });
        map.addLayer({
          id: "district-label",
          type: "symbol",
          source: "districts",
          layout: { "text-field": ["get", "label"], "text-size": 15, "text-font": ["Noto Sans Regular"] },
          paint: { "text-color": "#15233B", "text-halo-color": "#FFFFFF", "text-halo-width": 2 },
        });
        map.addSource("buildings", { type: "geojson", data: buildingGeoJson });
        map.addLayer({
          id: "building-points",
          type: "circle",
          source: "buildings",
          paint: {
            "circle-radius": 5,
            "circle-color": "#FFFFFF",
            "circle-stroke-width": 2,
            "circle-stroke-color": ["match", ["get", "district"], 13, "#2F5FE6", 17, "#DB2777", "#64748B"],
          },
        });
        const onClick = (event: MapMouseEvent) => {
          const feature = map.queryRenderedFeatures(event.point, { layers: ["district-fill"] })[0];
          if (feature) onSelectDistrict(Number(feature.properties?.district) as 13 | 17);
        };
        map.on("click", "district-fill", onClick);
        map.on("mouseenter", "district-fill", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "district-fill", () => { map.getCanvas().style.cursor = ""; });
      });
    });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onSelectDistrict]);

  return <div ref={containerRef} className="district-map" aria-label="Карта врачебных участков Петропавловска" />;
}
