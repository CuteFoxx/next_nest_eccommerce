import type { Product as ProductType } from "@/types/product";
import Image from "next/image";

const Product = ({ product }: { product: ProductType }) => {
  const heroImg = product.images.find((img) => img.position === 0);

  //   TODO ADD no image
  if (!heroImg) return null;

  return (
    <article className="w-64 rounded border p-4">
      <Image
        src={heroImg?.file?.url}
        alt={heroImg?.file.alt ?? product.name}
        width={256}
        height={256}
      />
      <h3>{product.name}</h3>
    </article>
  );
};

export default Product;
