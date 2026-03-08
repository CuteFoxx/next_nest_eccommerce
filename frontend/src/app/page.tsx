import Product from "@/components/product/product";
import { serverApi } from "@/lib/api.server";
import type { Product as ProductType } from "@/types/product";
import type { PaginatedResponse } from "@/types/pagination";
import CatalogMenuDesktop from "@/components/menu/catalogMenuDesktop";

export default async function Home() {
  const { data: products } = await serverApi
    .get<PaginatedResponse<ProductType>>("/products")
    .then((res) => res.data);

  const menuItems = await serverApi.get("/menu/tree").then((res) => res.data);

  return (
    <>
      <div className="z-2 relative mb-4 lg:grid lg:grid-cols-[1fr_4fr]">
        <CatalogMenuDesktop menuItems={menuItems} className="hidden lg:block" />
        <div>place for banner slider</div>
      </div>
      <div className="relative z-0 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Product product={product} key={product.id} />
        ))}
      </div>
    </>
  );
}
