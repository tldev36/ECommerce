import ListProduct from "@/components/product/ListProduct";

export default function ProductByCategoryPage({ params }: { params: { slug: string } }) {
  return <ListProduct slug={params.slug} />;
}
