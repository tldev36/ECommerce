import ListProduct from "@/components/product/ListProduct";

export default async function ProductByCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ phải await

  return <ListProduct slug={slug} />;
}
