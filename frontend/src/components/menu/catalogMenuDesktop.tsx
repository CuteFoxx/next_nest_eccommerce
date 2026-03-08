import Link from "next/link";
import { MenuItem } from "@/types/menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { ChevronRight } from "lucide-react";

interface CatalogMenuDesktopProps {
  className?: string;
  menuItems: MenuItem[];
}

function getItemHref(item: MenuItem): string {
  if (item.type === "LINK" && item.url) return item.url;
  if (item.category) return `/category/${item.category.slug}`;
  return "#";
}

const CatalogMenuDesktop = ({
  menuItems,
  className,
}: CatalogMenuDesktopProps) => {
  return (
    <NavigationMenu className={className} viewport={false}>
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuTrigger className="flex h-12 items-center gap-px text-lg">
              {item.label}
              <ChevronRight width={18} height={18} />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="left-full! top-0! mt-0!">
              <div className="w-100 md:w-150 lg:w-200 grid gap-4 p-1 md:grid-cols-2 lg:grid-cols-3">
                {item.children?.map((child) => (
                  <div key={child.id}>
                    <NavigationMenuLink
                      className="hover:bg-transparent"
                      asChild
                    >
                      <Link
                        href={getItemHref(child)}
                        className="mb-2 block text-sm font-semibold hover:underline"
                      >
                        {child.label}
                      </Link>
                    </NavigationMenuLink>
                    {child.children && child.children.length > 0 && (
                      <ul className="flex flex-col gap-1">
                        {child.children.map((grandchild) => (
                          <li key={grandchild.id}>
                            <NavigationMenuLink
                              className="hover:bg-transparent"
                              asChild
                            >
                              <Link
                                href={getItemHref(grandchild)}
                                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-muted-foreground block rounded-md px-2 py-1.5 text-sm no-underline transition-colors"
                              >
                                {grandchild.label}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default CatalogMenuDesktop;
