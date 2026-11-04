-- Preserve the selected color and warranty on each order item.
ALTER TABLE "OrderItem" ADD COLUMN "selection" JSONB;
