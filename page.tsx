import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, FileText, Calculator, Smartphone, ShieldCheck, Zap, Palette, MousePointer2, Download, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessIllustration from "@/components/BusinessIllustration";
import AdSlot from "@/components/AdSlot";

const templates = [
  { title: "Clásica", kind: "classic", desc: "Equilibrada y profesional para cualquier actividad." },
  { title: "Moderna", kind: "modern", desc: "Más visual, con color y una jerarquía clara." },
  { title: "Minimal", kind: "minimal", desc: "Limpia, elegante y con mucho espacio." },
  { title: "Elegante", kind: "elegant", desc: "Una opción más sofisticada para servicios premium." },
];

export default function Home() {
  return <>
    <Header />
    <main id="main">
      <section className="hero hero-v2">
        <div className="container hero-grid">
          <div className="hero-copy-block">
            <div className="hero-badge"><span className="hero-badge-dot"/> Gratis · Sin registro · PDF</div>
            <h1>Crea presupuestos profesionales <span>en minutos.</span></h1>
            <p className="hero-copy">Haz tu presupuesto, personalízalo y descárgalo en PDF. Fácil, rápido y con el aspecto de un documento profesional.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-large" href="/crear">Crear mi presupuesto <ArrowRight size={18}/></Link>
              <a className="hero-secondary-link" href="#como-funciona">Ver cómo funciona</a>
            </div>
            <div className="hero-trust"><Check size={15}/> Tus datos se guardan en tu dispositivo</div>
          </div>
          <div className="hero-visual" aria-label="Vista previa de un presupuesto profesional">
            <div className="hero-glow" aria-hidden="true"/>
            <div className="quote-window">
              <div className="quote-window-top"><div className="window-dots"><i/><i/><i/></div><span>Vista previa · A4</span><span className="window-status">Listo</span></div>
              <div className="hero-paper">
                <div className="paper-head-v2"><div><div className="paper-brand"><span className="mini-mark">✓</span> ESTUDIO NORTE</div><div className="paper-small">Diseño y desarrollo digital</div></div><div className="paper-meta-v2"><strong>PRESUPUESTO</strong><span>#PRES-2026-001</span><span>23/09/2026</span></div></div>
                <div className="paper-client"><span>PARA</span><strong>Cliente S.L.</strong><small>Madrid · CIF B12345678</small></div>
                <div className="paper-table-v2"><div className="paper-table-head"><span>Concepto</span><span>Total</span></div><div><span>Diseño de página web</span><strong>850,00 €</strong></div><div><span>Mantenimiento mensual × 2</span><strong>100,00 €</strong></div><div><span>Configuración inicial</span><strong>150,00 €</strong></div></div>
                <div className="paper-total-v2"><span>Total</span><strong>1.331,00 €</strong></div>
                <div className="paper-footer-v2">Presupuesto válido durante 30 días · IVA incluido</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="logo-strip"><div className="container logo-strip-inner"><span>Para autónomos y pequeños negocios</span><span>Electricistas</span><span>Diseñadores</span><span>Fotógrafos</span><span>Programadores</span><span>Profesionales</span></div></section>

      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Así de sencillo</span><h2>De cero a PDF en tres pasos</h2><p className="muted">Sin cuentas, sin aprender un programa y sin perder tiempo.</p></div>
          <div className="steps steps-v2">
            <Step n="01" icon={<MousePointer2 size={19}/>} title="Introduce tus datos" text="Añade tus datos, los del cliente y la información básica del presupuesto." />
            <Step n="02" icon={<Calculator size={19}/>} title="Añade tus servicios" text="Introduce conceptos, cantidades, descuentos e IVA. Los totales se calculan solos." />
            <Step n="03" icon={<Download size={19}/>} title="Personaliza y descarga" text="Elige un diseño, revisa el A4 en tiempo real y descarga tu PDF listo para enviar." />
          </div>
        </div>
      </section>

      <AdSlot placement="landing-middle" />

      <section className="section section-soft">
        <div className="container feature-grid-v2">
          <div className="section-illustration feature-illustration"><BusinessIllustration scene="work" /></div>
          <div className="feature-intro"><span className="eyebrow">Un generador, no un programa de contabilidad</span><h2>Todo lo que necesitas para hacer un buen presupuesto.</h2><p className="muted">Hemos quitado lo innecesario para que puedas terminar un presupuesto rápido, pero sin renunciar a un resultado profesional.</p><Link className="text-link" href="/crear">Probar el generador <ArrowRight size={16}/></Link></div>
          <div className="feature-list">
            <Feature icon={<FileText/>} title="PDF A4 profesional" text="Varias páginas, tablas limpias, totales claros y un documento listo para enviar." />
            <Feature icon={<Palette/>} title="Temas y personalización" text="Elige entre varios estilos, colores y opciones de visibilidad para adaptarlo a tu negocio." />
            <Feature icon={<Calculator/>} title="Cálculos automáticos" text="Subtotal, descuentos, base imponible, IVA y total calculados de forma consistente." />
            <Feature icon={<Smartphone/>} title="Pensado para móvil" text="Puedes crear un presupuesto desde el teléfono cuando estés con un cliente." />
            <Feature icon={<ShieldCheck/>} title="Privado por defecto" text="La primera versión guarda los datos y genera el PDF en tu dispositivo." />
            <Feature icon={<Zap/>} title="Sin registro" text="Entra, crea tu presupuesto y descarga. No necesitas crear una cuenta para empezar." />
          </div>
        </div>
      </section>

      <section className="section" id="plantillas">
        <div className="container"><div className="templates-section-top"><div><div className="section-heading templates-heading"><span className="eyebrow">Diseños</span><h2>Tu presupuesto, a tu estilo.</h2><p className="muted">No todos los negocios necesitan el mismo aspecto. Escoge un tema y cambia el color principal.</p></div></div><div className="templates-illustration"><BusinessIllustration scene="templates" /></div></div>
          <div className="templates templates-v2">{templates.map(t => <TemplateCard key={t.kind} {...t}/>)}</div>
        </div>
      </section>

      <AdSlot placement="landing-bottom" />

      <section className="section customization-showcase">
        <div className="container customization-card"><div className="customization-copy"><div className="eyebrow">Personalización</div><h2>Elige. Ajusta. Descarga.</h2><p>Tu logo, tu color, tu información y tu forma de presentar los servicios. La vista previa se actualiza mientras escribes.</p><ul><li><Check size={16}/> Logo y datos de empresa</li><li><Check size={16}/> 4 temas visuales</li><li><Check size={16}/> Color principal personalizable</li><li><Check size={16}/> Mostrar u ocultar teléfono, email y dirección</li></ul><Link className="btn btn-primary" href="/crear">Crear un presupuesto <ArrowRight size={17}/></Link></div><div className="custom-panel"><div className="custom-panel-header"><span>Diseño y personalización</span><Sparkles size={17}/></div><div className="custom-options"><div><small>Plantilla</small><div className="theme-pills"><span className="active">Clásica</span><span>Moderna</span><span>Minimal</span></div></div><div><small>Color principal</small><div className="color-palette"><i/><i/><i/><i/><i/></div></div><div className="toggle-row"><span>Mostrar email</span><b>✓</b></div><div className="toggle-row"><span>Mostrar teléfono</span><b>✓</b></div><div className="toggle-row"><span>Mostrar dirección</span><b>✓</b></div></div></div></div>
      </section>

      <section className="section" id="faq"><div className="container faq-wrap"><div className="section-heading left"><span className="eyebrow">FAQ</span><h2>Preguntas frecuentes</h2></div><div className="faq"><Faq q="¿Necesito registrarme?" a="No. Puedes crear y descargar presupuestos sin crear una cuenta."/><Faq q="¿Es realmente gratis?" a="Sí. La versión inicial está pensada para poder crear presupuestos y descargarlos en PDF sin pagar."/><Faq q="¿Puedo poner mi logo?" a="Sí. Puedes subir tu logo desde el dispositivo y verlo en la vista previa del presupuesto."/><Faq q="¿Puedo elegir el IVA?" a="Sí. Cada línea permite 0%, 4%, 10%, 21% o un porcentaje personalizado. Es una herramienta de cálculo, no asesoramiento fiscal."/><Faq q="¿Se guarda mi presupuesto?" a="El generador guarda un borrador y un historial local en este navegador. No hay sincronización en la nube en esta versión."/><Faq q="¿Funciona desde el móvil?" a="Sí. El editor está adaptado para pantallas pequeñas y la vista previa se reorganiza para que puedas trabajar desde el teléfono."/></div></div></section>

      <section className="section final-cta"><div className="container"><div className="cta cta-v2"><div className="cta-illustration"><BusinessIllustration scene="success" /></div><div><span className="eyebrow eyebrow-light">Listo para empezar</span><h2>Crea tu primer presupuesto gratis.</h2><p>Hazlo ahora y comprueba lo rápido que puede ser.</p></div><Link className="btn btn-white btn-large" href="/crear">Crear presupuesto <ArrowRight size={18}/></Link></div></div></section>
    </main>
    <Footer />
  </>;
}

function Step({n, icon, title, text}:{n:string;icon:React.ReactNode;title:string;text:string}) { return <div className="step step-v2"><div className="step-top"><span className="step-num-v2">{n}</span><span className="step-icon">{icon}</span></div><h3>{title}</h3><p className="muted">{text}</p></div>; }
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) { return <div className="feature"><span className="feature-icon">{icon}</span><div><h3>{title}</h3><p className="muted">{text}</p></div></div>; }
function Faq({q,a}:{q:string;a:string}) { return <details className="faq-item"><summary>{q}<span>+</span></summary><p className="muted">{a}</p></details>; }
function TemplateCard({title,kind,desc}:{title:string;kind:string;desc:string}) { return <div className="template-card template-card-v2"><div className={`template-paper ${kind}`}><div className="paper-preview-head"><div><div className="paper-title">MI EMPRESA</div><div className="muted" style={{fontSize:9}}>Servicios profesionales</div></div><span className="paper-price">PRESUPUESTO</span></div><div className="paper-rule"/><div className="paper-lines"><span/><span/><span/><span/></div><div className="paper-rule"/><div className="paper-total-line"><strong>Total</strong><strong>1.089,00 €</strong></div></div><div className="template-card-copy"><div><h3>{title}</h3><p>{desc}</p></div><span className="template-arrow"><ArrowRight size={16}/></span></div></div>; }
