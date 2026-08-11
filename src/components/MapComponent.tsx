import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix missing marker icons in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  locationCoords: { lat: number; lng: number };
  officeLocation?: { lat: number; lng: number; radius: number } | null;
  radiusColor?: string;
  showPopup?: boolean;
}

export default function MapComponent({ locationCoords, officeLocation, radiusColor = '#007AFF', showPopup = false }: MapProps) {
  // Cleanup map container on unmount to prevent reuse error during Fast Refresh
  useEffect(() => {
    return () => {
      // Leaflet cleanup if needed
    };
  }, []);

  return (
    <MapContainer 
      key={`${locationCoords.lat}-${locationCoords.lng}`}
      center={[locationCoords.lat, locationCoords.lng]} 
      zoom={16} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[locationCoords.lat, locationCoords.lng]}>
        {showPopup && <Popup>Lokasi Anda saat ini</Popup>}
      </Marker>
      
      {officeLocation && (
        <Circle 
          center={[officeLocation.lat, officeLocation.lng]}
          pathOptions={{ 
            color: radiusColor, 
            fillColor: radiusColor, 
            fillOpacity: 0.15 
          }}
          radius={officeLocation.radius}
        />
      )}
    </MapContainer>
  );
}
