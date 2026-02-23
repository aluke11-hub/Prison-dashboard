#!/usr/bin/env python3
import json
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "public" / "data" / "live_data.json"

def fetch_url(url, timeout=15):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; PrisonDashboardBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  Could not fetch {url}: {e}")
        return None

def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  Saved {DATA_FILE}")

def fetch_bop_population():
    url = "https://www.bop.gov/about/statistics/population_statistics.jsp"
    print(f"Fetching BOP population from {url}")
    html = fetch_url(url)
    if not html:
        return None, None
    patterns = [
        r"Total Federal Inmates[^0-9]*([0-9]{3},[0-9]{3})",
        r"Total Inmates[^0-9]*([0-9]{3},[0-9]{3})",
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            pop = int(m.group(1).replace(",", ""))
            if 100000 < pop < 300000:
                print(f"  BOP total population: {pop:,}")
                return pop, datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print("  Could not parse BOP population.")
    return None, None

def fetch_ice_population():
    url = "https://www.ice.gov/detain/detention-management"
    print(f"Fetching ICE detention count from {url}")
    html = fetch_url(url)
    if not html:
        return None, None
    patterns = [
        r"Currently Detained[^0-9]*([0-9]{2,3},[0-9]{3})",
        r"Total.*?Detain[^0-9]*([0-9]{2,3},[0-9]{3})",
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            pop = int(m.group(1).replace(",", ""))
            if 10000 < pop < 200000:
                print(f"  ICE detained: {pop:,}")
                return pop, datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print("  Could not parse ICE population.")
    return None, None

def run_update():
    print("=" * 50)
    print("  Prison Dashboard Monthly Updater")
    print(f"  {datetime.now(timezone.utc).isoformat()}")
    print("=" * 50)

    data = load_data()
    changes = []

    bop_pop, bop_date = fetch_bop_population()
    if bop_pop:
        old = data["bop"]["total_population"]
        if old != bop_pop:
            changes.append(f"BOP: {old:,} to {bop_pop:,}")
        data["bop"]["total_population"] = bop_pop
        data["bop"]["last_fetched"] = bop_date
        for ft in data["facility_types"]:
            if ft["type"] == "Federal Prisons (BOP)":
                ft["population"] = bop_pop
                break

    ice_pop, ice_date = fetch_ice_population()
    if ice_pop:
        old = data["ice"]["total_detained"]
        if old != ice_pop:
            changes.append(f"ICE: {old:,} to {ice_pop:,}")
        data["ice"]["total_detained"] = ice_pop
        data["ice"]["last_fetched"] = ice_date
        data["headline_stats"]["ice_detained_current"] = ice_pop
        for ft in data["facility_types"]:
            if ft["type"] == "Immigration (ICE)":
                ft["population"] = ice_pop
                break

    today = datetime.now(timezone.utc)
    data["_meta"]["last_updated"] = today.strftime("%Y-%m-%d")
    data["_meta"]["last_updated_by"] = "auto"
    if today.month == 12:
        next_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month + 1, day=1)
    data["_meta"]["next_update"] = next_month.strftime("%Y-%m-%d")
    data["headline_stats"]["data_as_of"] = today.strftime("%B %Y")

    save_data(data)

    print("\nChanges this month:")
    for c in changes:
        print(f"  {c}")
    if not changes:
        print("  No changes detected.")
    print("=" * 50)

if __name__ == "__main__":
    run_update()
    sys.exit(0)
