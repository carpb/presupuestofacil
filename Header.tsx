"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 680) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <div className="container header-inner">
        <BrandMark />
        <nav className="nav" aria-label="Navegación principal">
          <a href="/#como-funciona">Cómo funciona</a>
          <a href="/#plantillas">Plantillas</a>
          <a href="/#faq">FAQ</a>
          <Link className="nav-cta" href="/crear">Crear presupuesto <span aria-hidden="true">→</span></Link>
        </nav>
        <button
          type="button"
          className="btn btn-secondary mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <>
          <button type="button" className="mobile-menu-backdrop" aria-label="Cerrar menú" onClick={close} />
          <nav id={menuId} className="header-mobile-nav" aria-label="Menú móvil">
            <div className="header-mobile-nav-inner container">
              <Link href="/crear" onClick={close} className="mobile-nav-primary">Crear presupuesto <span aria-hidden="true">→</span></Link>
              <a href="/#como-funciona" onClick={close}>Cómo funciona</a>
              <a href="/#plantillas" onClick={close}>Plantillas</a>
              <a href="/#faq" onClick={close}>FAQ</a>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
