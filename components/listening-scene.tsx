import type { ListeningSceneId } from "@/lib/listening-bank";

type SceneProps = { scene: ListeningSceneId };

function Person({ x, y, scale = 1, facing = 1 }: { x: number; y: number; scale?: number; facing?: 1 | -1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <circle cx="0" cy="-54" r="17" className="scene-skin" />
      <path d="M-20-35h40l10 72h-60Z" className="scene-person" />
      <path d="M-10 37-15 88M10 37l16 51" className="scene-line" />
      <path d="M-18-20-48 18M18-20l42 8" className="scene-line" />
    </g>
  );
}

function Background() {
  return (
    <>
      <rect width="640" height="380" rx="28" className="scene-bg" />
      <path d="M0 305h640" className="scene-floor-line" />
      <circle cx="565" cy="70" r="34" className="scene-accent-soft" />
    </>
  );
}

export function ListeningScene({ scene }: SceneProps) {
  return (
    <figure className="listening-scene" aria-label="Illustration de la situation à écouter">
      <svg viewBox="0 0 640 380" role="img" aria-labelledby={`scene-${scene}`}>
        <title id={`scene-${scene}`}>Illustration originale pour un exercice de compréhension orale</title>
        <Background />
        {scene === "meeting-chairs" ? (
          <>
            <rect x="190" y="155" width="275" height="92" rx="16" className="scene-object" />
            <path d="M230 247v58M425 247v58" className="scene-line" />
            {[160, 275, 390, 505].map((x) => <g key={x}><rect x={x} y="105" width="54" height="56" rx="12" className="scene-accent" /><path d={`M${x+9} 161v55M${x+45} 161v55`} className="scene-line" /></g>)}
            <Person x={125} y={235} scale={.9} />
            <path d="M165 225c20-16 34-29 55-38" className="scene-motion" />
            <rect x="220" y="68" width="220" height="58" rx="10" className="scene-panel" />
          </>
        ) : null}
        {scene === "delivery-van" ? (
          <>
            <rect x="70" y="155" width="310" height="128" rx="20" className="scene-object" />
            <path d="M100 155v-60h180l70 60" className="scene-object scene-stroke" />
            <circle cx="145" cy="294" r="32" className="scene-wheel" /><circle cx="315" cy="294" r="32" className="scene-wheel" />
            <rect x="410" y="202" width="80" height="65" rx="8" className="scene-box" />
            <Person x={520} y={250} scale={.92} facing={-1} />
            <path d="M480 216h-78" className="scene-motion" />
          </>
        ) : null}
        {scene === "chef-counter" ? (
          <>
            <rect x="65" y="230" width="510" height="72" rx="12" className="scene-object" />
            <path d="M110 302v46M530 302v46" className="scene-line" />
            <Person x={315} y={225} scale={.95} />
            <path d="M285 162c5-28 55-28 60 0" className="scene-hat" />
            {[150,215,405,470].map((x) => <g key={x}><ellipse cx={x} cy="218" rx="42" ry="10" className="scene-plate" /><path d={`M${x-25} 211h50`} className="scene-line" /></g>)}
            <path d="M355 210c28 0 42 4 58 8" className="scene-motion" />
          </>
        ) : null}
        {scene === "watering-plants" ? (
          <>
            <rect x="65" y="90" width="180" height="210" rx="14" className="scene-panel" />
            <rect x="420" y="110" width="145" height="190" rx="14" className="scene-panel" />
            {[120,190,465,525].map((x, index) => <g key={x}><path d={`M${x} 260c-5-75 ${index%2?45:-40}-105 8-150 55 44 25 88 8 150Z`} className="scene-plant" /><rect x={x-28} y="258" width="58" height="48" rx="8" className="scene-pot" /></g>)}
            <Person x={330} y={245} scale={.95} />
            <path d="M285 215h-55l-20 25h72Z" className="scene-can" /><path d="M214 226c-28 2-48 10-70 26" className="scene-water" />
          </>
        ) : null}
        {scene === "machine-technicians" ? (
          <>
            <rect x="190" y="105" width="265" height="185" rx="20" className="scene-object" />
            <circle cx="280" cy="195" r="48" className="scene-gear" /><circle cx="280" cy="195" r="17" className="scene-bg" />
            <rect x="365" y="145" width="55" height="75" rx="8" className="scene-panel" />
            <Person x={105} y={265} scale={.85} /><Person x={535} y={265} scale={.85} facing={-1} />
            <path d="M145 214h53M495 215h-44" className="scene-motion" />
          </>
        ) : null}
        {scene === "boarding-gate" ? (
          <>
            <rect x="425" y="70" width="120" height="235" rx="12" className="scene-panel" />
            <rect x="448" y="115" width="72" height="85" rx="10" className="scene-screen" />
            <rect x="385" y="220" width="120" height="70" rx="12" className="scene-object" />
            <Person x={250} y={252} scale={.95} />
            <rect x="315" y="176" width="28" height="50" rx="5" className="scene-phone" />
            <path d="M335 205h72" className="scene-motion" />
            <path d="M70 300h250M92 267h75M195 267h75" className="scene-line" />
          </>
        ) : null}
        {scene === "bus-stop" ? (
          <>
            <path d="M65 285h520" className="scene-road" />
            <rect x="470" y="78" width="16" height="212" className="scene-pole" /><circle cx="478" cy="82" r="38" className="scene-accent" /><path d="M460 82h36" className="scene-line" />
            <rect x="90" y="205" width="230" height="66" rx="16" className="scene-object" /><circle cx="140" cy="282" r="24" className="scene-wheel" /><circle cx="270" cy="282" r="24" className="scene-wheel" />
            <Person x={380} y={265} scale={.78} /><Person x={535} y={265} scale={.78} facing={-1} />
          </>
        ) : null}
        {scene === "folders-shelf" ? (
          <>
            <rect x="70" y="60" width="300" height="250" rx="14" className="scene-object" />
            {[125,195,265].map((y) => <path key={y} d={`M70 ${y}h300`} className="scene-line" />)}
            {[95,140,190,245,300].map((x, i) => <rect key={x} x={x} y={78+(i%2)*70} width="34" height="42" rx="5" className="scene-folder" />)}
            <Person x={480} y={260} scale={.92} facing={-1} />
            <rect x="390" y="175" width="48" height="60" rx="5" className="scene-folder" />
            <path d="M444 206h-72" className="scene-motion" />
          </>
        ) : null}
        {scene === "bicycle-building" ? (
          <>
            <rect x="390" y="55" width="190" height="250" rx="12" className="scene-panel" /><rect x="455" y="175" width="70" height="130" rx="8" className="scene-door" />
            <circle cx="170" cy="270" r="55" className="scene-bike-wheel" /><circle cx="315" cy="270" r="55" className="scene-bike-wheel" />
            <path d="M170 270l62-85 83 85h-145l60-50 85 50M232 185h45" className="scene-bike" />
            <Person x={330} y={205} scale={.82} facing={-1} />
            <path d="M290 235c-18 20-25 30-32 48" className="scene-motion" />
          </>
        ) : null}
        {scene === "conference-banner" ? (
          <>
            <rect x="145" y="75" width="350" height="92" rx="14" className="scene-banner" />
            <path d="M165 120h310" className="scene-banner-line" />
            <Person x={115} y={250} scale={.92} /><Person x={525} y={250} scale={.92} facing={-1} />
            <path d="M152 187l58-55M488 132l-55 55" className="scene-motion" />
            <rect x="220" y="255" width="200" height="55" rx="10" className="scene-object" /><path d="M250 310v35M390 310v35" className="scene-line" />
          </>
        ) : null}
      </svg>
    </figure>
  );
}
