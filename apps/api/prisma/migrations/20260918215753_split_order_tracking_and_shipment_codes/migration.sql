-- The Order.trackingCode column was doing two jobs: it held the shop's own
-- code (OR-XXXXXX, issued at checkout and texted to the customer), and the
-- admin order screen then overwrote it with the courier's consignment number
-- when the order shipped. The customer's code stopped resolving at that point.
-- They are two different things and now have two columns.

ALTER TABLE "Order" ADD COLUMN "shipmentCode" TEXT;

-- Anything that is not one of ours is a courier number an admin typed in.
UPDATE "Order"
   SET "shipmentCode" = "trackingCode",
       "trackingCode" = NULL
 WHERE "trackingCode" IS NOT NULL
   AND "trackingCode" NOT LIKE 'OR-%';

-- Re-issue the shop code for every order now without one. Same derivation as
-- trackingCodeFromId('OR', id) in @technokhan/shared.
UPDATE "Order"
   SET "trackingCode" = 'OR-' || UPPER(RIGHT(REGEXP_REPLACE("id", '[^a-zA-Z0-9]', '', 'g'), 6))
 WHERE "trackingCode" IS NULL;

-- Six characters off the end of a cuid can in principle repeat; give the
-- losers a longer suffix so the unique index below can be created.
WITH duplicated AS (
  SELECT "id",
         ROW_NUMBER() OVER (PARTITION BY "trackingCode" ORDER BY "createdAt", "id") AS position
    FROM "Order"
   WHERE "trackingCode" IS NOT NULL
)
UPDATE "Order" o
   SET "trackingCode" = 'OR-' || UPPER(RIGHT(REGEXP_REPLACE(o."id", '[^a-zA-Z0-9]', '', 'g'), 12))
  FROM duplicated d
 WHERE d."id" = o."id"
   AND d.position > 1;

CREATE UNIQUE INDEX "Order_trackingCode_key" ON "Order"("trackingCode");
