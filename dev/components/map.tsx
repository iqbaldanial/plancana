'use client';

import { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import { symbol } from 'motion/react-client';

interface ArcGISMapProps {
  apiKey: string;
  center: [number, number];
  zoom: number;
  basemap: string;
}

const ArcGISMap: React.FC<ArcGISMapProps> = ({
  apiKey,
  center ,
  zoom ,
  basemap
}) => {
  const mapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set the API key
    if (typeof window !== 'undefined') {
      (window as any).esriConfig = {
        apiKey: apiKey
      };
    }

    // Load ArcGIS modules
    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/widgets/Zoom',
      'esri/widgets/Directions',
      'esri/layers/RouteLayer',
      'esri/rest/support/RouteParameters',
      'esri/rest/support/FeatureSet',
      'esri/widgets/Locate',
      'esri/Graphic'
    ], {
      css: true,
      version: '4.32'
    }).then(([Map, MapView, Zoom, Directions, RouteLayer, RouteParameters, FeatureSet,Locate,Graphic]) => {
      if (mapDiv.current) {
        // Create the map
        const map = new Map({
          basemap: basemap
        });

        // Create the map view
        const view = new MapView({
          container: mapDiv.current,
          map: map,
          center: center,
          zoom: zoom
        });

        // Create a route layer
        const routeLayer = new RouteLayer();
        map.add(routeLayer);

        //create graphic


        //create locate

        const locate = new Locate({
          view:view,
          graphic: new Graphic({
    symbol: { 
      type: "simple-marker",
          size: "12px",
          color: "green",
          outline: {
            color: "#efefef",
            width: "1.5px"
          }
     }  // overwrites the default symbol used for the
    // graphic placed at the location of the user when found
  })
        });
        view.ui.add(locate,'top-left')

        // Add directions widget with proper configuration
        const directionsWidget = new Directions({
          view: view,
          layer: routeLayer,
          routeServiceUrl: "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"
        });
        view.ui.add(directionsWidget, 'top-right');

        // Cleanup function
        return () => {
          if (view) {
            view.destroy();
          }
        };
      }
    }).catch((error) => {
      console.error('Error loading ArcGIS modules:', error);
    });
  }, [apiKey, center, zoom, basemap]);

  return (
    <div 
      ref={mapDiv} 
      style={{ 
        height: '100%', 
        width: '100%' 
      }}
    />
  );
};

export default ArcGISMap;