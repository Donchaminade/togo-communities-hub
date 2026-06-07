import { useState, useMemo } from 'react';
import { NeighborhoodData, Community } from '../types';
import { NEIGHBORHOODS } from '../data/togoData';
import { MapPin, Info, Users, Compass, ExternalLink } from 'lucide-react';

interface InteractiveMapProps {
  communities: Community[];
  selectedNeighborhood: string | null;
  onSelectNeighborhood: (neighborhoodId: string | null) => void;
  onSelectCommunity: (community: Community) => void;
}

export default function InteractiveMap({
  communities,
  selectedNeighborhood,
  onSelectNeighborhood,
  onSelectCommunity,
}: InteractiveMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Group approved/active communities by neighborhood name
  const neighborhoodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    communities.forEach((c) => {
      const parent = NEIGHBORHOODS.find((n) => n.name === c.neighborhood);
      if (parent) {
        counts[parent.id] = (counts[parent.id] || 0) + 1;
      }
    });
    return counts;
  }, [communities]);

  const activeNeighborhoodInfo = useMemo(() => {
    if (selectedNeighborhood) {
      return NEIGHBORHOODS.find((n) => n.id === selectedNeighborhood) || null;
    }
    if (hoveredDistrict) {
      return NEIGHBORHOODS.find((n) => n.id === hoveredDistrict) || null;
    }
    return null;
  }, [selectedNeighborhood, hoveredDistrict]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row h-full min-h-[500px]">
      
      {/* Dynamic Sidebar Info */}
      <div className="w-full lg:w-72 bg-gradient-to-br from-slate-50 via-white to-neutral-50/30 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 bg-togo-green rounded-lg text-white">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </span>
            <h3 className="text-sm font-bold tracking-wide uppercase text-togo-green">
              Carte de Lomé
            </h3>
          </div>
          
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Cliquez sur un quartier pour afficher ses communautés actives ou passez le curseur pour explorer la répartition de la tech au Togo.
          </p>

          {activeNeighborhoodInfo ? (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-togo-yellow"></span>
                {activeNeighborhoodInfo.displayName}
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {activeNeighborhoodInfo.description}
              </p>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Communautés :</span>
                <span className="font-bold bg-togo-green/10 text-togo-green px-2.5 py-0.5 rounded-full">
                  {neighborhoodCounts[activeNeighborhoodInfo.id] || 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center py-10">
              <MapPin className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs text-slate-400">Aucun quartier sélectionné</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Légende</h5>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded-md bg-togo-green"></span>
              <span>Sélection officielle</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded-md bg-togo-yellow"></span>
              <span>Quartier avec communautés</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200"></span>
              <span>Quartier sans communauté</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Map Area */}
      <div className="flex-1 bg-slate-50 relative p-4 flex items-center justify-center overflow-hidden min-h-[400px]">
        
        {/* Flag inspired top-right accent */}
        <div className="absolute top-4 right-4 flex gap-2 items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-[11px] font-bold text-slate-700">
          <div className="flex h-3 w-5 overflow-hidden rounded-[2px] border border-slate-200">
            <div className="bg-togo-red w-1/3 flex items-center justify-center">
              <span className="text-[6px] text-white">⭐</span>
            </div>
            <div className="flex-1 flex flex-col5 justify-between">
              <div className="bg-togo-green h-1/5"></div>
              <div className="bg-togo-yellow h-1/5"></div>
              <div className="bg-togo-green h-1/5"></div>
              <div className="bg-togo-yellow h-1/5"></div>
              <div className="bg-togo-green h-1/5"></div>
            </div>
          </div>
          <span>Togo Tech Map</span>
        </div>

        <svg 
          viewBox="0 0 600 400" 
          className="w-full max-w-[600px] h-auto drop-shadow-md select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tech Grid Background pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 106, 78, 0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="600" height="400" fill="url(#grid)" rx="16" />

          {/* Ghana Border indicators (Left side) */}
          <line x1="5" y1="5" x2="5" y2="360" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth="2" />
          <text x="12" y="20" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" className="font-medium tracking-wider">FRONTIÈRE GHANA</text>

          {/* Atlantic Ocean (Bottom side - Wave Coastline) */}
          <path 
            d="M 0,360 Q 150,345 300,360 T 600,360 L 600,400 L 0,400 Z" 
            fill="#1e293b" 
            opacity="0.8"
          />
          <path 
            d="M 0,365 Q 160,355 310,368 T 600,363 L 600,400 L 0,400 Z" 
            fill="#0f172a" 
          />
          <text x="300" y="388" fill="#ffffff" textAnchor="middle" fontSize="11" fontFamily="sans-serif" className="uppercase tracking-widest font-bold">Golfe de Guinée / Océan Atlantique</text>

          {/* District Connectors (Abstract Roads representing structure of Lomé) */}
          <path d="M 120,310 Q 230,220 320,310" fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="3" />
          <line x1="310" y1="280" x2="300" y2="190" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="2" />
          <line x1="80" y1="150" x2="200" y2="160" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="2" />
          <line x1="230" y1="70" x2="300" y2="190" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="2" strokeDasharray="3 3" />

          {/* Neighborhood Interactive Polygonal Bubbles */}
          {NEIGHBORHOODS.map((n) => {
            const isSelected = selectedNeighborhood === n.id;
            const isHovered = hoveredDistrict === n.id;
            const count = neighborhoodCounts[n.id] || 0;

            // Determine fill status
            let fillColor = "rgba(248, 250, 252, 0.85)"; // Idle Empty
            let strokeColor = "rgb(203, 213, 225)";
            let strokeWidth = "1.5";

            if (count > 0) {
              fillColor = "rgba(255, 206, 0, 0.08)"; // Yellow Active hue
              strokeColor = "rgba(255, 206, 0, 0.85)";
            }
            if (isHovered) {
              fillColor = "rgba(0, 106, 78, 0.1)"; // Togo Green hover
              strokeColor = "rgb(0, 106, 78)";
              strokeWidth = "2.5";
            }
            if (isSelected) {
              fillColor = "rgba(0, 106, 78, 0.2)"; // Togo Green selected
              strokeColor = "rgb(0, 106, 78)";
              strokeWidth = "3.5";
            }

            return (
              <g 
                key={n.id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectNeighborhood(isSelected ? null : n.id)}
                onMouseEnter={() => setHoveredDistrict(n.id)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {/* Visual zone boundary circle representation */}
                <circle 
                  cx={n.x} 
                  cy={n.y} 
                  r="45" 
                  fill={fillColor} 
                  stroke={strokeColor} 
                  strokeWidth={strokeWidth} 
                  className="transition-all duration-300"
                />

                {/* Accent mini-pin circle */}
                <circle 
                  cx={n.x} 
                  cy={n.y - 12} 
                  r="4" 
                  fill={count > 0 ? "rgb(255, 206, 0)" : "rgb(148, 163, 184)"} 
                />

                {/* Name tag text shadow */}
                <text 
                  x={n.x} 
                  y={n.y + 6} 
                  fill="#ffffff" 
                  stroke="#ffffff"
                  strokeWidth="3"
                  fontSize="10" 
                  textAnchor="middle" 
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {n.displayName}
                </text>

                {/* Name tag text */}
                <text 
                  x={n.x} 
                  y={n.y + 6} 
                  fill={isSelected ? "rgb(0, 106, 78)" : isHovered ? "rgb(0, 106, 78)" : count > 0 ? "#855800" : "rgb(100, 116, 139)"} 
                  fontSize="10" 
                  textAnchor="middle" 
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {n.displayName}
                </text>

                {/* Tag representing Count of Communities inside the neighborhood */}
                {count > 0 && !isSelected && (
                  <g transform={`translate(${n.x + 18}, ${n.y - 25})`}>
                    <rect 
                      x="-10" 
                      y="-8" 
                      width="20" 
                      height="15" 
                      rx="5" 
                      fill="rgb(0, 106, 78)" 
                    />
                    <text 
                      fill="#ffffff" 
                      fontSize="9" 
                      fontWeight="bold"
                      textAnchor="middle" 
                      y="2.5"
                    >
                      {count}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Plotting individual communities as exact pins on top */}
          {communities.map((c, idx) => {
            // Find parent neighborhood matching community
            const neighbor = NEIGHBORHOODS.find((n) => n.name === c.neighborhood);
            if (!neighbor) return null;

            // Give slightly offset pins surrounding the core neighborhood coordinate to prevent overlapping
            const angle = (idx * 2 * Math.PI) / (communities.length || 1);
            // Smaller radius to keep them close to neighborhood center but individual
            const offsetDist = 18;
            const pinX = neighbor.x + Math.cos(angle) * offsetDist;
            const pinY = neighbor.y + Math.sin(angle) * offsetDist;

            return (
              <g 
                key={`pin-${c.id || idx}`}
                className="cursor-pointer group/pin"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCommunity(c);
                }}
              >
                {/* Glowing aura */}
                <circle 
                  cx={pinX} 
                  cy={pinY} 
                  r="8" 
                  fill="rgba(210, 22, 38, 0.45)" 
                  className="animate-ping"
                />

                {/* Real pin dot */}
                <circle 
                  cx={pinX} 
                  cy={pinY} 
                  r="5" 
                  fill="rgb(210, 22, 38)" // Red pin dot inspired by Togolese red star
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="group-hover/pin:scale-125 transition-transform duration-200"
                />

                {/* Tiny Star inside representing Togo flag design */}
                <polygon
                  points={`${pinX},${pinY-1.5} ${pinX+0.5},${pinY-0.5} ${pinX+1.5},${pinY-0.5} ${pinX+0.7},${pinY+0.3} ${pinX+1},${pinY+1.2} ${pinX},${pinY+0.6} ${pinX-1},${pinY+1.2} ${pinX-0.7},${pinY+0.3} ${pinX-1.5},${pinY-0.5} ${pinX-0.5},${pinY-0.5}`}
                  fill="#ffffff"
                  className="scale-75 origin-center"
                />

                {/* Floating Micro-tooltip */}
                <g className="opacity-0 group-hover/pin:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect 
                    x={pinX - 50} 
                    y={pinY - 26} 
                    width="100" 
                    height="16" 
                    rx="4" 
                    fill="rgb(15, 23, 42)" 
                  />
                  <text 
                    x={pinX} 
                    y={pinY - 15} 
                    fill="#ffffff" 
                    fontSize="8" 
                    textAnchor="middle" 
                    fontFamily="sans-serif"
                    fontWeight="medium"
                  >
                    {c.name.length > 18 ? c.name.substring(0, 16) + '..' : c.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Clear selection badge */}
        {selectedNeighborhood && (
          <button 
            onClick={() => onSelectNeighborhood(null)}
            className="absolute bottom-16 left-4 bg-slate-900 text-white leading-none px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            ❌ Réinitialiser la vue
          </button>
        )}
      </div>
    </div>
  );
}
