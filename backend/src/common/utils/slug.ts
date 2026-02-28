export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Returns a slug that is unique within the given Prisma model table.
 * Appends "-1", "-2", … derived from a single count query.
 *
 * @param base    Output of generateSlug()
 * @param counter Counts rows where slug equals base OR starts with "base-"
 *
 * @example
 * const slug = await uniqueSlug(base, (s) =>
 *   prisma.product.count({ where: { OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }] } }),
 * );
 */
export async function uniqueSlug(
  base: string,
  counter: (base: string) => Promise<number>,
): Promise<string> {
  const count = await counter(base);
  return count === 0 ? base : `${base}-${count}`;
}
