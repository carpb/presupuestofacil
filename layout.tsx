import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { siteUrl } from "@/lib/site";
import AdSenseProvider from "@/components/AdSenseProvider";
import AdBlockRecovery from "@/components/AdBlockRecovery";

export const metadata: Metadata = {
  title: "PresupuestoFácil — Crea presupuestos profesionales en minutos",
  description: "Crea presupuestos profesionales, calcula impuestos y descarga tu presupuesto en PDF. Gratis y sin registro.",
  metadataBase: new URL(siteUrl),
  icons: { icon: "/presupuesto-facil-mark.png", apple: "/presupuesto-facil-mark.png" },
  openGraph: {
    title: "PresupuestoFácil",
    description: "Crea presupuestos profesionales en minutos.",
    url: siteUrl,
    siteName: "PresupuestoFácil",
    images: ["/presupuesto-facil-mark.png"],
    type: "website",
    locale: "es_ES"
  },
  alternates: { canonical: "/" },
  applicationName: "PresupuestoFácil",
  category: "business",
  creator: "PresupuestoFácil",
  publisher: "PresupuestoFácil",
  twitter: { card: "summary", title: "PresupuestoFácil — Crea presupuestos profesionales en minutos", description: "Crea, personaliza y descarga presupuestos profesionales en PDF." },
  robots: { index: true, follow: true },
  keywords: ["crear presupuesto", "hacer presupuesto", "presupuesto online", "generar presupuesto PDF", "plantilla presupuesto", "presupuesto para autónomos", "crear presupuesto gratis"],
  formatDetection: { email: false, address: false, telephone: false }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AdSenseProvider />
        <AdBlockRecovery />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PresupuestoFácil",
              url: siteUrl,
              description: "Crea presupuestos profesionales en minutos y descárgalos en PDF.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              featureList: ["Crear presupuestos", "Cálculos automáticos", "Plantillas", "Descarga en PDF"]
            })
          }}
        />
      </body>
    </html>
  );
}
