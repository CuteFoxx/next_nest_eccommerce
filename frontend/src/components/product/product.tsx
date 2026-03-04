import type { Product as ProductType } from "@/types/product";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";

const Product = ({ product }: { product: ProductType }) => {
  const heroImg = product.images.find((img) => img.position === 0);

  //   TODO ADD no image
  if (!heroImg) return null;

  return (
    <div className="group relative w-auto hover:z-10">
      <div className="border-1-gray-300 flex w-full flex-col gap-2 border bg-white p-4 transition-all group-hover:absolute group-hover:shadow-2xl">
        <Link href={`/product/${product.slug}`}>
          <Image
            className="min-h-27.5 lg:min-h-55 w-full object-cover px-4"
            src={heroImg?.file?.url}
            alt={heroImg?.file.alt ?? product.name}
            width={210}
            height={210}
            sizes="(max-width: 768px) 120px, 210px"
          />
        </Link>
        <Link
          className="line-clamp-2 text-sm font-semibold"
          href={`/product/${product.slug}`}
        >
          {product.name}
        </Link>
        <div className="flex justify-between align-baseline">
          <div>
            {product.compareAtPrice && (
              <div className="text-sm text-gray-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </div>
            )}
            <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
          </div>
          <Button className="cursor-pointer">
            <ShoppingCart />
          </Button>
        </div>
        {/* TODO make this a link to link to specific attribute values */}
        <div className="gap-2.25 hidden flex-col group-hover:flex">
          {Object.entries(product.attributes).map(([slug, attr]) => (
            <div key={slug} className="text-sm">
              <span className="font-semibold text-gray-500">{attr.name}:</span>{" "}
              {attr.values.map((v) => v.name).join(", ")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;
