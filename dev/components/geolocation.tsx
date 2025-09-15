'use client';

import { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

interface ArcGISMapProps {
  label: string;
  latField: string;
  lngField: string;
  form: any;
  setForm: (form: any) => void;
}

export default function ArcGISMap({ label, latField, lngField, form, setForm }: ArcGISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let view: any;

    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/widgets/Search',
      'esri/Graphic'
    ], { css: true }).then(([Map, MapView, Search, Graphic]) => {
      const map = new Map({ basemap: 'streets-navigation-vector' });

      view = new MapView({
        container: mapRef.current!,
        map,
        center: [parseFloat(form[lngField]) || 101.6869, parseFloat(form[latField]) || 3.139],
        zoom: 10
      });

      const search = new Search({ view });
      view.ui.add(search, 'top-right');

      // Update form when search completes
      search.on("select-result", function (event: any) {
        const { latitude, longitude } = event.result.feature.geometry;
        setForm((prev: any) => ({
          ...prev,
          [latField]: latitude.toFixed(6),
          [lngField]: longitude.toFixed(6),
        }));
      });

      // Allow manual click
      view.on("click", function (event: any) {
        const point = {
          type: "point",
          longitude: event.mapPoint.longitude,
          latitude: event.mapPoint.latitude
        };

        const graphic = new Graphic({
          geometry: point,
          symbol: {
            type: "simple-marker",
            color: "blue",
            size: "8px"
          }
        });

        view.graphics.removeAll();
        view.graphics.add(graphic);

        setForm((prev: any) => ({
          ...prev,
          [latField]: point.latitude.toFixed(6),
          [lngField]: point.longitude.toFixed(6),
        }));
      });
    });

    return () => {
      if (view) view.destroy();
    };
  }, [latField, lngField, setForm]);

  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <div ref={mapRef} className="h-64 w-full border rounded" />
      <div className="mt-2 flex gap-2 text-sm text-gray-600">
        <span>Lat: {form[latField]}</span>
        <span>Lng: {form[lngField]}</span>
      </div>
    </div>
  );
}
