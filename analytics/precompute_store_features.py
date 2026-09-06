"""Offline batch job: per-store price and travel-cost features.

Reads the sample catalog (`../assets/items.json`) and a small store-locations
dataset (`assets/storeLocations.json`), and writes one aggregate row per store
to `output/store_features.json`: how much of the catalog it carries, how its
prices compare to the other stores, and its travel distance from a fixed
reference point.

This is the offline counterpart to what the frontend's
`computeVisitCostByStore` (`Geo/travelCost.ts`) already computes per basket,
per request - here it runs once, over the whole catalog, so the optimizer
can read a precomputed feature file instead of recomputing distance for
every basket. See `docs/prd-search-infra-extension.md` for why.

The Haversine distance below is a small, separate reimplementation of the
frontend's TypeScript `haversineDistanceKm` - a batch job in a different
runtime does not share code across that language boundary, stated plainly
rather than silently duplicated without comment.

Run: `python3 precompute_store_features.py` (from this directory; needs
only `pyspark`, no cluster - `local[*]` master).
"""

import json
import math
import os

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType

EARTH_RADIUS_KM = 6371.0
# A fixed reference point in Quebec City (Vieux-Quebec), standing in for
# "the shopper's home" the frontend's Geo module takes as a per-request
# parameter - here it's a constant so the whole catalog can be aggregated
# once per store instead of once per shopper.
HOME_LAT = 46.8139
HOME_LON = -71.2080

ITEMS_PATH = os.path.join(os.path.dirname(__file__), "..", "assets", "items.json")
STORE_LOCATIONS_PATH = os.path.join(os.path.dirname(__file__), "assets", "storeLocations.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "output", "store_features.json")


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance, matching frontend/src/utils/Geo/haversine.ts."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    r_lat1 = math.radians(lat1)
    r_lat2 = math.radians(lat2)

    h = (
        math.sin(d_lat / 2) ** 2
        + math.cos(r_lat1) * math.cos(r_lat2) * math.sin(d_lon / 2) ** 2
    )
    return 2 * EARTH_RADIUS_KM * math.asin(min(1.0, math.sqrt(h)))


def load_item_supplier_rows(spark: SparkSession, items_path: str):
    """Flattens items.json into one row per (item ref code, supplier, price)."""
    with open(items_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    rows = []
    for item in items:
        ref_code = item["ref"]["code"]
        for supplier_entry in item.get("suppliers", []):
            price = supplier_entry.get("pricing", {}).get("normal")
            if price is None or price < 0:
                continue
            rows.append((ref_code, supplier_entry["supplier"], float(price)))

    return spark.createDataFrame(rows, schema=["ref_code", "supplier", "price"])


def compute_store_features(spark: SparkSession, items_path: str, store_locations_path: str):
    item_supplier_df = load_item_supplier_rows(spark, items_path)

    with open(store_locations_path, "r", encoding="utf-8") as f:
        store_locations = json.load(f)
    store_locations_df = spark.createDataFrame(store_locations)

    haversine_udf = F.udf(
        lambda lat, lon: haversine_distance_km(HOME_LAT, HOME_LON, lat, lon),
        DoubleType(),
    )
    store_locations_df = store_locations_df.withColumn(
        "travel_distance_km", haversine_udf(F.col("lat"), F.col("lon"))
    )

    # Cheapest price per item, so each supplier's rows can be compared against
    # the catalog-wide minimum for that same item.
    cheapest_per_item = item_supplier_df.groupBy("ref_code").agg(
        F.min("price").alias("cheapest_price")
    )

    priced = item_supplier_df.join(cheapest_per_item, on="ref_code")
    priced = priced.withColumn(
        "is_cheapest", (F.col("price") == F.col("cheapest_price")).cast("int")
    )

    per_store = priced.groupBy("supplier").agg(
        F.countDistinct("ref_code").alias("catalog_coverage"),
        F.round(F.avg("price"), 2).alias("avg_price"),
        F.round(F.avg("is_cheapest") * 100, 1).alias("cheapest_price_share_pct"),
    )

    result = (
        per_store.join(store_locations_df, on="supplier")
        .select(
            "supplier",
            "name",
            "catalog_coverage",
            "avg_price",
            "cheapest_price_share_pct",
            F.round("travel_distance_km", 2).alias("travel_distance_km"),
        )
        .orderBy("supplier")
    )

    return result


def main():
    spark = SparkSession.builder.appName("basket-store-features").master("local[*]").getOrCreate()
    spark.sparkContext.setLogLevel("WARN")

    try:
        result_df = compute_store_features(spark, ITEMS_PATH, STORE_LOCATIONS_PATH)
        rows = [row.asDict() for row in result_df.collect()]

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2)

        print(f"Wrote {len(rows)} store feature rows to {OUTPUT_PATH}")
        for row in rows:
            print(row)
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
