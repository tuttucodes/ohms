import Link from "next/link";
import Image from "next/image";

export interface CategoryTile {
  label: string;
  subcategory: string;
  image: string;
  count: number;
}

interface CategoryTilesProps {
  tiles: CategoryTile[];
}

export function CategoryTiles({ tiles }: CategoryTilesProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {tiles.map((tile) => (
        <Link
          key={tile.subcategory}
          href={`/shop?subcategory=${encodeURIComponent(tile.subcategory)}`}
          className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-surface-sunken shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
        >
          <Image
            src={tile.image}
            alt={tile.label}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-leaf-900/70 via-leaf-900/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-display text-lg font-semibold text-white">
              {tile.label}
            </h3>
            <p className="text-xs text-white/80">{tile.count} styles</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
