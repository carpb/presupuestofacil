import Link from "next/link";
import BrandMark from "./BrandMark";

export default function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div>
        <BrandMark compact />
        <p className="muted footer-copy">Crea presupuestos profesionales en minutos. Gratis y sin registro.</p>
      </div>
      <div><div className="footer-title">Producto</div><div className="footer-links"><Link href="/crear">Crear presupuesto</Link><a href="/#plantillas">Plantillas</a><a href="/#faq">Preguntas frecuentes</a></div></div>
      <div><div className="footer-title">Legal</div><div className="footer-links"><Link href="/aviso-legal">Aviso legal</Link><Link href="/privacidad">Privacidad</Link><Link href="/cookies">Cookies</Link></div></div>
      <div><div className="footer-title">Ayuda</div><div className="footer-links"><Link href="/contacto">Contacto</Link><Link href="/accesibilidad">Accesibilidad</Link></div></div>
    </div>
    <div className="container footer-bottom">© 2026 PresupuestoFácil · Todos los derechos reservados</div>
  </footer>;
}
