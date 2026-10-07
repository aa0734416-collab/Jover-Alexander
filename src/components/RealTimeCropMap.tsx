import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Crosshair, 
  Compass, 
  Radio, 
  Satellite, 
  Maximize2, 
  Info, 
  Check, 
  Activity,
  Droplets,
  ExternalLink
} from 'lucide-react';
import { CropBatch, TelemetryReading } from '../types';

interface RealTimeCropMapProps {
  crops: CropBatch[];
  activeCropId: string;
  onSelectCrop: (id: string) => void;
  onUpdateCropCoordinates: (cropId: string, lat: number, lng: number) => void;
  readings: TelemetryReading[];
}

export const RealTimeCropMap: React.FC<RealTimeCropMapProps> = ({
  crops,
  activeCropId,
  onSelectCrop,
  onUpdateCropCoordinates,
  readings,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets' | 'dark'>('satellite');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsTracking, setGpsTracking] = useState<boolean>(false);
  const [selectedCropOnMap, setSelectedCropOnMap] = useState<CropBatch | null>(null);

  const activeCrop = crops.find(c => c.id === activeCropId) || crops[0];

  // Tile layer URLs
  const tileLayers = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };

  const tileAttributions = {
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    streets: '&copy; OpenStreetMap contributors',
    dark: '&copy; OpenStreetMap &copy; CARTO',
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = activeCrop?.latitude || -4.032745;
      const centerLng = activeCrop?.longitude || -79.202318;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 17,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add base layer
      const currentTile = L.tileLayer(tileLayers[mapLayer], {
        attribution: tileAttributions[mapLayer],
        maxZoom: 19,
      }).addTo(map);

      // Layer group for crop markers
      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      mapInstanceRef.current = map;
      (map as any)._baseTileLayer = currentTile;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base tile layer on layer state change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }

    const newLayer = L.tileLayer(tileLayers[mapLayer], {
      attribution: tileAttributions[mapLayer],
      maxZoom: 19,
    }).addTo(map);

    (map as any)._baseTileLayer = newLayer;
  }, [mapLayer]);

  // Update Crop Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    crops.forEach((crop) => {
      const isActive = crop.id === activeCropId;
      const cropReading = readings.find(r => r.cropId === crop.id);

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-crop-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: ${isActive ? '#10b981' : '#0f172a'};
            border: 2px solid ${isActive ? '#ffffff' : '#34d399'};
            border-radius: 50%;
            box-shadow: 0 0 15px ${isActive ? 'rgba(16, 185, 129, 0.7)' : 'rgba(0,0,0,0.5)'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="
              color: ${isActive ? '#0f172a' : '#34d399'};
              font-weight: 900;
              font-size: 11px;
              font-family: monospace;
            ">${crop.systemType}</span>
            ${isActive ? `
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid #10b981;
                opacity: 0.7;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([crop.latitude || -4.032745, crop.longitude || -79.202318], {
        icon: customIcon,
        draggable: true,
      });

      // Draggable marker update coordinates
      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        onUpdateCropCoordinates(crop.id, Number(newLatLng.lat.toFixed(6)), Number(newLatLng.lng.toFixed(6)));
      });

      marker.on('click', () => {
        setSelectedCropOnMap(crop);
        onSelectCrop(crop.id);
      });

      // Bind tooltip
      marker.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px; font-weight: bold; color: #0f172a;">
          ${crop.name} (${crop.systemType})
          <br/><span style="font-size: 9px; font-weight: normal; color: #475569;">
            pH: ${cropReading ? cropReading.ph.toFixed(2) : '6.05'} | EC: ${cropReading ? cropReading.ec.toFixed(2) : '1.80'} mS/cm
          </span>
        </div>
      `, { direction: 'top', offset: [0, -20] });

      markersGroup.addLayer(marker);
    });
  }, [crops, activeCropId, readings]);

  // Center map on active crop
  const handleCenterOnCrop = (crop: CropBatch) => {
    const map = mapInstanceRef.current;
    if (map && crop.latitude && crop.longitude) {
      map.flyTo([crop.latitude, crop.longitude], 18, { duration: 1.2 });
      setSelectedCropOnMap(crop);
    }
  };

  // Live GPS tracking of user device in greenhouse
  const handleToggleGps = () => {
    if (!gpsTracking) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setGpsTracking(true);

            const map = mapInstanceRef.current;
            if (map) {
              map.flyTo([latitude, longitude], 18);

              if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([latitude, longitude]);
              } else {
                const userIcon = L.divIcon({
                  className: 'user-gps-marker',
                  html: `
                    <div style="
                      width: 20px;
                      height: 20px;
                      background: #0284c7;
                      border: 3px solid #ffffff;
                      border-radius: 50%;
                      box-shadow: 0 0 10px #0284c7;
                    "></div>
                  `,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                });
                userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
              }
            }
          },
          (err) => {
            alert(`No se pudo obtener la ubicación GPS: ${err.message}`);
          },
          { enableHighAccuracy: true }
        );
      } else {
        alert('Geolocalización no soportada en este navegador.');
      }
    } else {
      setGpsTracking(false);
      if (userMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Toolbar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Mapa Satelital en Tiempo Real de Cultivos & Sensores
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                GPS LIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Coordenadas de precisión de bancadas, módulos de recirculación y nodos IoT
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                mapLayer === 'satellite' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" /> Satélite
            </button>
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                mapLayer === 'streets' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Calles
            </button>
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                mapLayer === 'dark' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Oscuro
            </button>
          </div>

          {/* GPS Tracking Button */}
          <button
            onClick={handleToggleGps}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              gpsTracking
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${gpsTracking ? 'animate-spin' : ''}`} />
            <span>{gpsTracking ? 'GPS Activo' : 'Mi Ubicación'}</span>
          </button>
        </div>
      </div>

      {/* Main Map View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Map Frame */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative min-h-[460px] bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-[460px] z-10" />

          {/* Floating Coordinate HUD overlay */}
          <div className="absolute top-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-xs shadow-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Coordenadas del Cultivo Activo:</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-400">
              Lat: <strong>{activeCrop.latitude.toFixed(6)}°</strong> | Lon: <strong>{activeCrop.longitude.toFixed(6)}°</strong>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Altitud: {activeCrop.altitudeMeters || 2154} msnm</span>
              <span className="text-slate-500 italic">Arrastre el marcador para mover</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Crops List with Coordinates */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Geolocalización de Lotes ({crops.length})
            </h4>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
              {crops.map((c) => {
                const isActive = c.id === activeCropId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCrop(c.id);
                      handleCenterOnCrop(c);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition ${
                      isActive
                        ? 'bg-slate-950 border-emerald-500 shadow-lg text-white ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200 truncate max-w-[140px]">{c.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400">
                        {c.systemType}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-slate-400 space-y-0.5">
                      <div>Lat: {c.latitude?.toFixed(6)}</div>
                      <div>Lng: {c.longitude?.toFixed(6)}</div>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{c.location}</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Crosshair className="w-2.5 h-2.5" /> Centrar
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Haga clic en cualquier marcador para enfocar y ver el estado de su nodo sensor.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
