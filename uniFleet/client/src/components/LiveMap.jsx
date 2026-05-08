import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function makeBusIcon(isEmergency, isTracked, isVisible, routeColor = '#10b981') {
  if (!isVisible) {
    return L.divIcon({ className: '', html: '<div style="display:none;"></div>', iconSize: [0,0] });
  }

  const bgColor = isEmergency ? '#ef4444' : routeColor;
  const size = isTracked ? 20 : 16;
  const offset = size / 2;
  const border = '2px solid #000'; // black border matching the image
  
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

const ROUTE_PATHS = {
  'Route 10A': [
    [31.9539, 35.9106],
    [31.9600, 35.9150],
    [31.9680, 35.9150],
    [31.9800, 35.9400]
  ],
  'Route 15': [
    [31.9539, 35.9106],
    [31.9400, 35.9200],
    [31.9300, 35.9500],
    [31.9100, 35.9800]
  ],
  'University Express': [
    [31.9539, 35.9106],
    [31.9700, 35.9350],
    [31.9850, 35.9550],
    [31.9950, 35.9750]
  ]
};

const ROUTE_COLORS = {
  'Route 10A': '#3b82f6', // الأزرق
  'Route 15': '#8b5cf6', // البنفسجي
  'University Express': '#f59e0b', // البرتقالي
};

export default function LiveMap({ buses = [], height = '430px', trackedBusId = null, activeRoute = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const pathsRef = useRef({});
  
  // حفظ آخر باص أو خط تم تتبعه لمنع إعادة التكبير التلقائي المزعج
  const lastTrackedRef = useRef(null);
  const lastActiveRouteRef = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: [31.9539, 35.9106],
      zoom: 12,
      zoomControl: true,
    });
    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Map data ©2026 Google'
    }).addTo(mapInstance.current);
  }, []);

  const basePathsRef = useRef({});

  useEffect(() => {
    if (!mapInstance.current) return;

    // Draw static base routes ONCE to give context
    Object.keys(ROUTE_PATHS).forEach(routeName => {
        if (!basePathsRef.current[routeName]) {
            const poly = L.polyline(ROUTE_PATHS[routeName], {
                color: ROUTE_COLORS[routeName],
                weight: 5,
                opacity: 0.75, // Increased visibility based on feedback
                dashArray: '8, 8'
            }).addTo(mapInstance.current);
            basePathsRef.current[routeName] = poly;
        }
    });

    // Update static routes visibility based on active filter
    Object.keys(basePathsRef.current).forEach(routeName => {
        const poly = basePathsRef.current[routeName];
        if (activeRoute && routeName === activeRoute) {
             poly.setStyle({ opacity: 0.75 }); // show clearly ONLY if it's the active route
        } else {
             poly.setStyle({ opacity: 0 }); // hide by default or if not selected
        }
    });
    
    // ==========================================
    // 1. نظام الـ Zoom والـ Focus الذكي
    // ==========================================
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
      // Always include the actual route path so it zooms even if empty
      if (ROUTE_PATHS[activeRoute]) {
          ROUTE_PATHS[activeRoute].forEach(coord => bounds.extend(coord));
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
      
      // التتبع له الأولوية القصوى
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
        if (pathsRef.current[strBusId]) {
           pathsRef.current[strBusId].remove();
           delete pathsRef.current[strBusId];
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

        const historyPath = ROUTE_PATHS[assignedRouteName] || ROUTE_PATHS['Route 10A'];
        const numId = parseInt(strBusId.replace(/\D/g, '')) || 100;
        const offset = (numId % 5) * 0.0001;
        
        const assignedPathCoords = historyPath.map(coord => [coord[0] + offset, coord[1] + offset]);
        if (bus.lat && bus.lng) {
            assignedPathCoords.push([parseFloat(bus.lat), parseFloat(bus.lng)]);
        }

        const polylineOptions = {
          color: routeColor, 
          weight: isTracked ? 6 : 4, 
          opacity: isTracked ? 1.0 : 0.8,
          dashArray: isTracked ? '10, 10' : null 
        };

        if (!pathsRef.current[strBusId]) {
           const poly = L.polyline(assignedPathCoords, polylineOptions)
           .bindTooltip(tooltipText, { sticky: true, className: 'path-tooltip' })
           .addTo(mapInstance.current);
           pathsRef.current[strBusId] = poly;
        } else {
           pathsRef.current[strBusId].setLatLngs(assignedPathCoords);
           pathsRef.current[strBusId].setStyle(polylineOptions);
           pathsRef.current[strBusId].setTooltipContent(tooltipText);
        }
      }
    });

    // Cleanup removed buses
    Object.keys(markersRef.current).forEach(id => {
       if (!currentBusIds.has(id)) {
           markersRef.current[id].remove();
           delete markersRef.current[id];
       }
    });
    Object.keys(pathsRef.current).forEach(id => {
       if (!currentBusIds.has(id)) {
           pathsRef.current[id].remove();
           delete pathsRef.current[id];
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
