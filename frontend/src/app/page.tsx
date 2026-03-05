import Product from "@/components/product/product";
import { serverApi } from "@/lib/api.server";
import type { Product as ProductType } from "@/types/product";
import type { PaginatedResponse } from "@/types/pagination";

export default async function Home() {
  const { data: products } = await serverApi
    .get<PaginatedResponse<ProductType>>("/products")
    .then((res) => res.data);

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Product product={product} key={product.id} />
      ))}
    </div>
  );
}
