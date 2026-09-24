import Generator from "@/components/Generator";

export const metadata = {
  title: "Crear presupuesto online gratis — PresupuestoFácil",
  description: "Crea un presupuesto online, añade servicios e impuestos, personalízalo y descarga un PDF profesional. Sin registro.",
  alternates: { canonical: "/crear" },
  robots: { index: true, follow: true }
};

export default function CreatePage() {
  return <Generator />;
}
