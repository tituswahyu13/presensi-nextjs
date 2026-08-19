"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  position: [number, number];
  radius: number;
  onPositionChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, radius, onPositionChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <>
      <Marker position={position} />
      <Circle center={position} radius={radius || 0} />
    </>
  );
}

export default function MapPicker({ position, radius, onPositionChange }: MapPickerProps) {
  // Center map on initial position
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300 relative z-0">
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} radius={radius} onPositionChange={onPositionChange} />
      </MapContainer>
    </div>
  );
}
