import Link from "next/link";

export default function BrandMark({ withName = true, compact = false }: { withName?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={`brand brand-logo ${compact ? "brand-compact" : ""}`} aria-label="PresupuestoFácil, inicio">
      <img src="/presupuesto-facil-mark.png" alt="" className="brand-image" />
      {withName && <span className="brand-name"><span>Presupuesto</span><strong>Fácil</strong></span>}
    </Link>
  );
}
