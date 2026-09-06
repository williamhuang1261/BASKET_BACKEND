import os
import sys

import pytest
from pyspark.sql import SparkSession

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from precompute_store_features import (  # noqa: E402
    compute_store_features,
    haversine_distance_km,
    ITEMS_PATH,
    STORE_LOCATIONS_PATH,
    HOME_LAT,
    HOME_LON,
)


@pytest.fixture(scope="module")
def spark():
    session = (
        SparkSession.builder.appName("basket-store-features-test")
        .master("local[2]")
        .getOrCreate()
    )
    yield session
    session.stop()


@pytest.fixture(scope="module")
def result_rows(spark):
    df = compute_store_features(spark, ITEMS_PATH, STORE_LOCATIONS_PATH)
    return {row["supplier"]: row.asDict() for row in df.collect()}


# Hand-checked against the known 25-item sample catalog
# (assets/items.json): every item-supplier row with a non-negative price,
# grouped by supplier.
EXPECTED_COVERAGE = {"iga": 7, "metro": 11, "provigo": 8}
EXPECTED_AVG_PRICE = {"iga": 5.2, "metro": 5.36, "provigo": 4.93}
EXPECTED_CHEAPEST_SHARE_PCT = {"iga": 100.0, "metro": 90.9, "provigo": 100.0}


def test_returns_one_row_per_store(result_rows):
    assert set(result_rows.keys()) == {"iga", "metro", "provigo"}


@pytest.mark.parametrize("supplier", ["iga", "metro", "provigo"])
def test_catalog_coverage_matches_hand_count(result_rows, supplier):
    assert result_rows[supplier]["catalog_coverage"] == EXPECTED_COVERAGE[supplier]


@pytest.mark.parametrize("supplier", ["iga", "metro", "provigo"])
def test_avg_price_matches_hand_calculation(result_rows, supplier):
    assert result_rows[supplier]["avg_price"] == pytest.approx(
        EXPECTED_AVG_PRICE[supplier], abs=0.01
    )


@pytest.mark.parametrize("supplier", ["iga", "metro", "provigo"])
def test_cheapest_price_share_matches_hand_calculation(result_rows, supplier):
    assert result_rows[supplier]["cheapest_price_share_pct"] == pytest.approx(
        EXPECTED_CHEAPEST_SHARE_PCT[supplier], abs=0.1
    )


@pytest.mark.parametrize("supplier", ["iga", "metro", "provigo"])
def test_travel_distance_matches_haversine_from_home(result_rows, spark, supplier):
    import json

    with open(STORE_LOCATIONS_PATH, "r", encoding="utf-8") as f:
        stores = {s["supplier"]: s for s in json.load(f)}

    expected = haversine_distance_km(
        HOME_LAT, HOME_LON, stores[supplier]["lat"], stores[supplier]["lon"]
    )
    assert result_rows[supplier]["travel_distance_km"] == pytest.approx(expected, abs=0.05)


def test_haversine_known_distance():
    # Paris to London, a commonly cited ~343-344km great-circle distance -
    # the same known-value check the frontend's haversine test uses.
    distance = haversine_distance_km(48.8566, 2.3522, 51.5074, -0.1278)
    assert distance == pytest.approx(343.5, abs=1.0)
