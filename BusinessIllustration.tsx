import type { SVGProps } from "react";

type Scene = "hero" | "work" | "templates" | "success";

export default function BusinessIllustration({ scene = "hero", className = "", ...props }: { scene?: Scene; className?: string } & SVGProps<SVGSVGElement>) {
  const title = {
    hero: "Ilustración de un presupuesto profesional",
    work: "Ilustración de una persona preparando un presupuesto",
    templates: "Ilustración de documentos y diseños profesionales",
    success: "Ilustración de un presupuesto terminado",
  }[scene];

  return (
    <svg className={`business-illustration ${className}`} viewBox="0 0 560 360" role="img" aria-label={title} {...props}>
      <defs>
        <linearGradient id={`bi-blob-${scene}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef6ff" />
          <stop offset="1" stopColor="#f4fbf8" />
        </linearGradient>
      </defs>
      <path d="M85 45C146 12 234 25 286 61c49 34 93 20 139 32 65 17 94 83 67 144-28 64-109 92-185 86-73-6-109 10-175-17-69-28-103-99-77-165 15-39 30-78 30-96z" fill={`url(#bi-blob-${scene})`} />
      {scene === "hero" && <HeroScene />}
      {scene === "work" && <WorkScene />}
      {scene === "templates" && <TemplatesScene />}
      {scene === "success" && <SuccessScene />}
    </svg>
  );
}

function Document({ x, y, w = 190, h = 235, rotate = 0, accent = "#2563eb" }: { x:number;y:number;w?:number;h?:number;rotate?:number;accent?:string }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect width={w} height={h} rx="14" fill="#fff" stroke="#d8e3ee" strokeWidth="3" />
    <rect x="22" y="25" width={w*.42} height="11" rx="5.5" fill={accent} opacity=".92" />
    <rect x="22" y="51" width={w*.67} height="7" rx="3.5" fill="#e5ebf2" />
    <rect x="22" y="72" width={w*.54} height="7" rx="3.5" fill="#edf1f5" />
    <rect x="22" y="105" width={w*.78} height="8" rx="4" fill="#eef2f6" />
    <rect x="22" y="126" width={w*.66} height="8" rx="4" fill="#eef2f6" />
    <rect x="22" y="147" width={w*.72} height="8" rx="4" fill="#eef2f6" />
    <rect x="22" y={h-53} width={w*.36} height="10" rx="5" fill="#e9f7f2" />
    <rect x={w*.61} y={h-58} width={w*.25} height="20" rx="10" fill="#edf5ff" />
  </g>;
}

function Person({ x, y, scale = 1, shirt = "#2563eb" }: { x:number;y:number;scale?:number;shirt?:string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle cx="0" cy="0" r="24" fill="#ffd8bd" />
    <path d="M-23-3c2-18 14-28 28-23 10 3 17 12 18 24-8-7-16-10-25-8-7 1-12 4-21 7z" fill="#24364a" />
    <path d="M-39 87c3-38 17-57 39-57s36 19 39 57" fill={shirt} />
    <path d="M-15 34l15 18 15-18" fill="#fff" opacity=".88" />
    <circle cx="-8" cy="3" r="2.5" fill="#24364a" /><circle cx="9" cy="3" r="2.5" fill="#24364a" />
    <path d="M-5 13c4 3 8 3 12 0" fill="none" stroke="#d88d72" strokeWidth="2" strokeLinecap="round" />
  </g>;
}

function Plant({ x, y, scale=1 }: { x:number;y:number;scale?:number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M0 48C-5 25 2 5 18-7c2 21-5 40-18 55z" fill="#45b77f" />
    <path d="M7 48C18 24 32 14 46 14c-3 21-17 31-39 39z" fill="#69c796" />
    <path d="M3 46C-13 27-12 12-4-1c13 15 14 29 7 47z" fill="#82d0a5" />
    <path d="M-8 45h50l-6 34H-2z" fill="#e9b17a" />
  </g>;
}

function Check({ x, y, scale=1 }: { x:number;y:number;scale?:number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r="25" fill="#18a477" />
    <path d="M-11 0l8 8 16-19" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </g>;
}

function Spark({ x, y, scale=1 }: { x:number;y:number;scale?:number }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0-15L4-4 15 0 4 4 0 15-4 4-15 0-4-4z" fill="#4c8ff7" opacity=".72" />;
}

function Calculator({ x, y, scale=1 }: { x:number;y:number;scale?:number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale}) rotate(-7)`}>
    <rect x="-25" y="-34" width="50" height="68" rx="9" fill="#fff" stroke="#d5e0eb" strokeWidth="3" />
    <rect x="-15" y="-22" width="30" height="11" rx="3" fill="#dcecff" />
    {[-9, 3, 15].map((cx) => <circle key={cx} cx={cx} cy={2} r="4" fill={cx === -9 ? "#2563eb" : "#dce5ef"} />)}
    {[-9, 3, 15].map((cx) => <circle key={cx} cx={cx} cy={16} r="4" fill="#dce5ef" />)}
  </g>;
}

function HeroScene() {
  return <>
    <Document x={128} y={66} w={220} h={255} accent="#2563eb" />
    <Person x={395} y={135} scale={1.08} shirt="#2563eb" />
    <Plant x={54} y={255} scale={.72} />
    <Check x={385} y={235} scale={.75} />
    <Spark x={450} y={82} />
  </>;
}

function WorkScene() {
  return <>
    <Document x={82} y={78} w={215} h={245} accent="#0f8b78" rotate={-2} />
    <Person x={363} y={136} scale={1.02} shirt="#0f8b78" />
    <Person x={457} y={187} scale={.66} shirt="#d97706" />
    <Calculator x={330} y={275} scale={.82} />
    <Plant x={45} y={265} scale={.62} />
    <Spark x={446} y={87} scale={.8} />
  </>;
}

function TemplatesScene() {
  return <>
    <Document x={98} y={82} w={170} h={220} rotate={-7} accent="#2563eb" />
    <Document x={250} y={67} w={170} h={220} rotate={7} accent="#0f8b78" />
    <Check x={408} y={270} scale={.74} />
    <Plant x={49} y={258} scale={.64} />
    <Spark x={438} y={93} />
  </>;
}

function SuccessScene() {
  return <>
    <Document x={112} y={58} w={230} h={260} accent="#2563eb" />
    <Check x={304} y={257} scale={1} />
    <Person x={402} y={139} scale={1.03} shirt="#2563eb" />
    <Plant x={54} y={264} scale={.66} />
    <Spark x={458} y={86} />
    <Spark x={433} y={65} scale={.55} />
  </>;
}
