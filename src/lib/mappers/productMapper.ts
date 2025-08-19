// mappers/productMapper.ts
import { products, Prisma } from "@/generated/prisma";
import { Product } from "@/types/product";

export class ProductMapper {
  /**
   * Convert từ Prisma (DB model) -> Domain (Product interface)
   */
  static toDomain(db: products & { categories?: any }): Product {
    return {
      id: db.id,
      name: db.name,
      slug: db.slug,
      price: db.price.toNumber(),
      cost_price: db.cost_price.toNumber(),
      unit: db.unit,
      image: db.image,
      short: db.short,
      category_id: db.category_id,
      featured: db.featured, // boolean | null
      discount: db.discount ? db.discount.toNumber() : null,
      is_new: db.is_new ?? false,
      is_best_seller: db.is_best_seller ?? false,
      created_at: db.created_at ?? undefined,
      updated_at: db.updated_at ?? undefined,
      categories: db.categories ?? null,
    };
  }

  /**
   * Convert từ Domain (Product interface) -> Prisma input
   */
  static toPersistence(p: Product): Omit<products, "id"> {
    return {
      name: p.name,
      slug: p.slug,
      price: new Prisma.Decimal(p.price),
      cost_price: new Prisma.Decimal(p.cost_price),
      unit: p.unit,
      image: p.image,
      short: p.short ?? null,
      category_id: p.category_id ?? null,
      featured: p.featured ?? null, // giữ đúng với DB: boolean | null
      discount: p.discount != null ? new Prisma.Decimal(p.discount) : null,
      is_new: p.is_new ?? false,
      is_best_seller: p.is_best_seller ?? false,
      created_at: p.created_at ?? new Date(),
      updated_at: p.updated_at ?? new Date(),
    };
  }

  /**
   * Convert mảng từ Prisma -> Domain
   */
  static toDomainArray(dbs: (products & { categories?: any })[]): Product[] {
    return dbs.map((db) => this.toDomain(db));
  }
}
