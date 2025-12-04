import ProductDetailClient from "./ProductDetailClient";

// 1. GENERACIÓN ESTÁTICA
// Definimos qué páginas existen realmente.
// Al poner esto, Next.js generará "out/chaufa.html" y "out/tallarin.html"
export async function generateStaticParams() {
  return [
    { slug: 'chaufa' },
    { slug: 'tallarin' },
    { slug: 'aeropuerto' }
  ];
}

// 2. COMPONENTE DE PÁGINA (SERVER)
export default function Page({ params }: { params: { slug: string } }) {
  // Simplemente llamamos al componente cliente y le pasamos el slug
  return <ProductDetailClient slug={params.slug} />;
}