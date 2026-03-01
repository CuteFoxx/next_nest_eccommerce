import Product from "@/components/product/product";
import { serverApi } from "@/lib/api.server";
import type { Product as ProductType } from "@/types/product";

export default async function Home() {
  const products = await serverApi
    .get<ProductType[]>("/products")
    .then((res) => res.data);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {products.map((product) => (
        <Product product={product} key={product.id} />
      ))}
    </div>
  );
}
