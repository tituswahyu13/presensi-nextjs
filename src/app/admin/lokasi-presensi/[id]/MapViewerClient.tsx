"use client";

import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("@/components/MapViewer"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center rounded-lg border border-[var(--border)]">Memuat Peta...</div>
});

interface MapViewerClientProps {
  position: [number, number];
  radius: number;
}

export default function MapViewerClient({ position, radius }: MapViewerClientProps) {
  return <MapViewer position={position} radius={radius} />;
}
