-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "short" TEXT,
    "category_id" INTEGER,
    "featured" BOOLEAN DEFAULT false,
    "discount" DECIMAL(5,2),
    "is_new" BOOLEAN DEFAULT false,
    "is_best_seller" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "public"."products"("slug");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
