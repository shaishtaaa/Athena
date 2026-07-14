import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Define style options
const STYLES = {
  'Dark OSINT': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  'Default': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  'Satellite': {
    version: 8,
    sources: {
      'satellite-tiles': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri'
      }
    },
    layers: [
      {
        id: 'satellite',
        type: 'raster',
        source: 'satellite-tiles',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  'Terrain': {
    version: 8,
    sources: {
      'terrain-tiles': {
        type: 'raster',
        tiles: ['https://a.tile.opentopomap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: 'Tiles &copy; OpenTopoMap'
      }
    },
    layers: [
      {
        id: 'terrain',
        type: 'raster',
        source: 'terrain-tiles',
        minzoom: 0,
        maxzoom: 17
      }
    ]
  }
};

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [currentStyle, setCurrentStyle] = useState<keyof typeof STYLES>('Dark OSINT');

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map using current selected style
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLES[currentStyle] as any,
      center: [0, 0], // starting position [lng, lat]
      zoom: 1 // starting zoom
    });

    mapRef.current = map;

    // Apply the 3D globe projection initially and every time a style completes loading
    map.on('style.load', () => {
      map.setProjection({
        type: 'globe'
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update map style dynamically
  const selectStyle = (styleName: keyof typeof STYLES) => {
    setCurrentStyle(styleName);
    if (mapRef.current) {
      mapRef.current.setStyle(STYLES[styleName] as any);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '100%', background: '#090a0c' }} 
      />

      {/* Floating Modern Selector in top-right corner */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '10px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 10,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          color: 'rgba(255, 255, 255, 0.5)', 
          textTransform: 'uppercase',
          letterSpacing: '0.7px',
          marginBottom: '6px',
          paddingLeft: '4px'
        }}>
          Map Style
        </div>
        
        {(Object.keys(STYLES) as Array<keyof typeof STYLES>).map((styleName) => (
          <button
            key={styleName}
            onClick={() => selectStyle(styleName)}
            style={{
              background: currentStyle === styleName ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: currentStyle === styleName ? '#60a5fa' : 'rgba(255, 255, 255, 0.85)',
              border: currentStyle === styleName ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (currentStyle !== styleName) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentStyle !== styleName) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {styleName}
          </button>
        ))}
      </div>
    </div>
  );
}
