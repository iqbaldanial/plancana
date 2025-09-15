'use client';

import dynamic from 'next/dynamic';
import { CardTitle } from './ui/card';

// Dynamically import the ArcGIS Map component to avoid SSR issues
const ArcGISMap = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  apiKey: string;
  center: [number, number];
  zoom: number;
  basemap: string;
  cropId?: string;
}

export default function MapWrapper({ apiKey, center, zoom, basemap, cropId }: MapWrapperProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <CardTitle>
            <a href="/map">Crop Locations</a>
        </CardTitle>
        <div className=" pt-4 h-96">
          <ArcGISMap
            apiKey={apiKey}
            center={center}
            zoom={zoom}
            basemap={basemap}
            cropId={cropId}
            primary={false}
          />
        </div>
      </div>
    </div>
  );
}