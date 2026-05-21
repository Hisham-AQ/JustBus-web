import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';


function makeBusIcon(isEmergency, isTracked, isVisible, routeColor = '#10b981') {
 if (!isVisible) {

    return L.divIcon({
      className: '',
      html: '<div style="display:none;"></div>',
      iconSize: [0,0]
    });

  }
  const bgColor = isEmergency ? '#ef4444' : routeColor;
  const size = isTracked ? 20 : 16;
  const offset = size / 2;
  const border = '2px solid #000'; 
  
  const glow = isTracked ? `box-shadow: 0 0 0 3px rgba(255,255,255,0.8);` : '';

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bgColor};border:${border};${glow}
      transition:all 0.4s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [offset, offset],
  });
}



const ROUTE_COLORS = {
  'Route 10A': '#3b82f6',
  'Route 15': '#8b5cf6',
  'University Express': '#f59e0b',
};

export default function LiveMap({ buses = [], height = '430px', trackedBusId = null, activeRoute = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const routingRef = useRef({});
  
  const lastTrackedRef = useRef(null);
  const lastActiveRouteRef = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: [31.9539, 35.9106],
      zoom: 12,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Map data ©2026 Google'
    }).addTo(mapInstance.current);
  }, []);


  useEffect(() => {
    if (!mapInstance.current) return;


    let clearedTracked = false;
    let clearedRoute = false;

    if (trackedBusId && trackedBusId !== lastTrackedRef.current) {
      const bus = buses.find(b => String(b.busId) === String(trackedBusId) || b.plateNumber === trackedBusId);
      if (bus && bus.lat && bus.lng) {
        mapInstance.current.setView([bus.lat, bus.lng], 16, { animate: true, duration: 1.5 });
        lastTrackedRef.current = trackedBusId;
      }
    } else if (!trackedBusId && lastTrackedRef.current) {
      lastTrackedRef.current = null;
      clearedTracked = true;
    }

    if (activeRoute && activeRoute !== lastActiveRouteRef.current) {
      const routeBuses = buses.filter(b => {
         const rName = b.routeId || (String(b.busId).includes('1') ? 'Route 10A' : 'University Express');
         return rName === activeRoute;
      });
      const validCoords = routeBuses.filter(b => b.lat && b.lng).map(b => [b.lat, b.lng]);
      
      const bounds = L.latLngBounds([]);
      let hasBounds = false;

      if (validCoords.length > 0) {
          validCoords.forEach(c => bounds.extend(c));
          hasBounds = true;
      }


      if (hasBounds) {
          mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
          lastActiveRouteRef.current = activeRoute;
      }
    } else if (!activeRoute && lastActiveRouteRef.current) {
      lastActiveRouteRef.current = null;
      clearedRoute = true;
    }

    // Return to default ONLY if both are cleared
    if (!trackedBusId && !activeRoute && (clearedTracked || clearedRoute)) {
      mapInstance.current.setView([31.9539, 35.9106], 12, { animate: true });
    }

    const currentBusIds = new Set(buses.map(b => String(b.busId)));

    // Ensure we don't hide everything if a tracked bus isn't found yet
    const hasTrackedBusInList = trackedBusId ? buses.some(b => String(b.busId) === String(trackedBusId) || b.plateNumber === trackedBusId) : false;

    buses.forEach((bus) => {
      const strBusId = String(bus.busId);
      const assignedRouteName = bus.routeId || (strBusId.includes('1') ? 'Route 10A' : 'University Express');
      const isTracked = trackedBusId && (strBusId === trackedBusId || bus.plateNumber === trackedBusId);
      
      let isVisible = true;
      
      
      if (trackedBusId && hasTrackedBusInList) {
          if (!isTracked) isVisible = false;
      } else if (activeRoute) {
          if (assignedRouteName !== activeRoute) isVisible = false;
      }

      if (!bus.lat || !bus.lng || isNaN(parseFloat(bus.lat)) || isNaN(parseFloat(bus.lng))) {
          isVisible = false;
      }

      const isEmergency = bus.status === 'fault' || bus.status === 'emergency';
      const routeColor = ROUTE_COLORS[assignedRouteName] || '#10b981';
      const icon = makeBusIcon(isEmergency, isTracked, isVisible, routeColor);
      
      const tooltipText = `🚌 Bus ID: ${strBusId}${bus.driverName ? ` | 👨‍✈️ Driver: ${bus.driverName}` : ' | 👨‍✈️ Unknown Driver'}`;
      
      if (!isVisible) {
        if (markersRef.current[strBusId]) {
           markersRef.current[strBusId].remove();
           delete markersRef.current[strBusId];
        }
        if (routingRef.current[strBusId]) {

  mapInstance.current.removeControl(
    routingRef.current[strBusId]
  );

  delete routingRef.current[strBusId];
}
        
      } else {
        if (markersRef.current[strBusId]) {
          markersRef.current[strBusId].setLatLng([parseFloat(bus.lat), parseFloat(bus.lng)]);
          markersRef.current[strBusId].setIcon(icon);
          markersRef.current[strBusId].setTooltipContent(tooltipText);
        } else {
          const marker = L.marker([parseFloat(bus.lat), parseFloat(bus.lng)], { icon })
            .bindTooltip(tooltipText, {
              permanent: false, direction: 'top', offset: [0, -10],
            })
            .addTo(mapInstance.current);
          markersRef.current[strBusId] = marker;
        }
       const destination = bus.dropoffLocation;


  const shouldShowRoute =
  isTracked || activeRoute === assignedRouteName;

if (!shouldShowRoute) {

  if (routingRef.current[strBusId]) {

    mapInstance.current.removeControl(
      routingRef.current[strBusId]
    );

    delete routingRef.current[strBusId];
  }

  return;
}
  if (
  destination[0] &&
  destination[1] &&
  shouldShowRoute
) 
{

    const previousLat =
  routingRef.current[strBusId]
    ?.getWaypoints?.()[0]?.latLng?.lat;

const previousLng =
  routingRef.current[strBusId]
    ?.getWaypoints?.()[0]?.latLng?.lng;
if (routingRef.current[strBusId]) {

  if (
  Math.abs(previousLat - parseFloat(bus.lat)) < 0.0001 &&
  Math.abs(previousLng - parseFloat(bus.lng)) < 0.0001
) {
  return;
}

  routingRef.current[strBusId].setWaypoints([
    
    L.latLng(
      parseFloat(bus.lat),
      parseFloat(bus.lng)
    ),
    L.latLng(
      destination[0],
      destination[1]
    )
    
  ]);

} else {

  const routingControl =
    L.Routing.control({

      router: L.Routing.osrmv1({
  serviceUrl:
    'https://routing.openstreetmap.de/routed-car/route/v1'
}),

      waypoints: [

        L.latLng(
          parseFloat(bus.lat),
          parseFloat(bus.lng)
        ),

        L.latLng(
          destination[0],
          destination[1]
        )

      ],

      lineOptions: {
        styles: [
          {
            color: routeColor,
            weight: isTracked ? 7 : 5,
            opacity: 1,
            smoothFactor: 1
          }
        ]
      },

      createMarker: () => null,

      addWaypoints: false,

      draggableWaypoints: false,

      fitSelectedRoutes: false,

      show: false,

      routeWhileDragging: false

    }).addTo(mapInstance.current);

  routingControl.on(
    'routesfound',
    function(e) {

      const route = e.routes[0];

      const etaMinutes =
        Math.ceil(
          route.summary.totalTime / 60
        );

      console.log(
        `ETA: ${etaMinutes} mins`
      );
    }
  );

  routingRef.current[strBusId] =
    routingControl;
}}}
    });

    // Cleanup removed buses
    Object.keys(markersRef.current).forEach(id => {
       if (!currentBusIds.has(id)) {
           markersRef.current[id].remove();
           delete markersRef.current[id];
       }
    });
    Object.keys(routingRef.current).forEach(id => {

   if (!currentBusIds.has(id)) {

      mapInstance.current.removeControl(
        routingRef.current[id]
      );

      delete routingRef.current[id];
   }
});

  }, [buses, trackedBusId, activeRoute]);

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .leaflet-tile-pane {
          filter: ${trackedBusId ? 'brightness(0.3) grayscale(0.5)' : 'brightness(1) grayscale(0)'};
          transition: filter 0.8s ease;
        }
        @keyframes pulse-bus {
          0%, 100% { box-shadow: 0 0 6px #10b981; }
          50% { box-shadow: 0 0 16px #10b981, 0 0 30px #10b981; }
        }
        @keyframes pulse-alert {
          0%, 100% { box-shadow: 0 0 8px #ef4444; }
          50% { box-shadow: 0 0 20px #ef4444, 0 0 40px #ef4444; }
        }
        @keyframes pulse-tracked {
          0%, 100% { box-shadow: 0 0 0px 4px rgba(59,130,246,0.6), 0 0 12px #3b82f6; transform: scale(1); }
          50% { box-shadow: 0 0 0px 8px rgba(59,130,246,0.3), 0 0 24px #3b82f6; transform: scale(1.1); }
        }
        .leaflet-container { background: #1a1f2e !important; }
      `}</style>
      <div ref={mapRef} style={{ height, borderRadius: '10px', zIndex: 0 }} />
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '10px', zIndex: 999,
        background: 'rgba(23,26,31,.9)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '8px 12px', fontSize: '0.7rem',
        backdropFilter: 'blur(6px)', pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          Active Bus
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          Emergency
        </div>
      </div>
    </div>
  );
}
