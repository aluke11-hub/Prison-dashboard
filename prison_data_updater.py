#!/usr/bin/env python3
"""
prison_data_updater.py
======================
Runs on the 1st of every month via GitHub Actions.
Fetches publicly available data from BOP and ICE,
then patches data/live_data.json with updated figures.

Sources that CAN be auto-fetched:
  - BOP population (scrapes bop.gov stats page)
  - ICE detention total (scrapes ice.gov stats page)

Sources that must remain MANUAL (no public API):
  - State prison populations (BJS annual report — comes out each fall)
  - State budgets (state legislative sessions — annual/biennial)
  - Congressional committee chairs (change after elections)
  - Federal budget figures (when new appropriations bills pass)

The script will:
  1. Fetch BOP population from bop.gov
  2. Fetch ICE detention count from ice.gov
  3. Update live_data.json with new values + timestamp
  4. Log what changed vs. previous month
  5. GitHub Actions commits the updated file automatically
"""

import json
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "live_data.json"

# ── Utility ──────────────────────────────────────────────────────────────────

def fetch_url(url, timeout=15):
    """Fetch a URL with a browser-like user agent. Returns text or None."""
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; PrisonDashboardBot/1.0; +https://github.com)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ⚠️  Could not fetch {url}: {e}")
        return None


def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  ✅  Saved {DATA_FILE}")


# ── BOP Population ────────────────────────────────────────────────────────────

def fetch_bop_population():
    """
    Scrapes the BOP weekly population statistics page.
    Returns (total_population, as_of_date) or (None, None).
    BOP page: https://www.bop.gov/about/statistics/population_statistics.jsp
    The page contains a line like:
      Total Federal Inmates  155,972
    """
    url = "https://www.bop.gov/about/statistics/population_statistics.jsp"
    print(f"\n📡 Fetching BOP population from {url}")
    html = fetch_url(url)
    if not html:
        return None, None

    # Pattern: large number after "Total Federal Inmates" or similar heading
    # BOP uses a table — look for the total row
    patterns = [
        r"Total Federal Inmates[^0-9]*([0-9]{3},[0-9]{3})",
        r"Total Inmates[^0-9]*([0-9]{3},[0-9]{3})",
        r"Total[^0-9]{1,30}([1-9][0-9]{2},[0-9]{3})\s*\n",
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            pop = int(m.group(1).replace(",", ""))
            if 100000 < pop < 300000:  # sanity check
                print(f"  ✅  BOP total population: {pop:,}")
                return pop, datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Fallback: look for any 6-digit number near "inmate" keyword
    m = re.search(r"inmate[^0-9]{1,50}([1-9][0-9]{2},[0-9]{3})", html, re.IGNORECASE)
    if m:
        pop = int(m.group(1).replace(",", ""))
        if 100000 < pop < 300000:
            print(f"  ✅  BOP population (fallback parse): {pop:,}")
            return pop, datetime.now(timezone.utc).strftime("%Y-%m-%d")

    print("  ⚠️  Could not parse BOP population from page. Page structure may have changed.")
    print("      Manual update needed: visit bop.gov/about/statistics/population_statistics.jsp")
    return None, None


# ── ICE Detention ─────────────────────────────────────────────────────────────

def fetch_ice_population():
    """
    Scrapes the ICE detention management page for current total detained.
    Returns (total_detained, as_of_date) or (None, None).
    ICE page: https://www.ice.gov/detain/detention-management
    Typically shows: "Currently Detained: 68,000" or similar.
    """
    url = "https://www.ice.gov/detain/detention-management"
    print(f"\n📡 Fetching ICE detention count from {url}")
    html = fetch_url(url)
    if not html:
        return None, None

    patterns = [
        r"Currently Detained[^0-9]*([0-9]{2,3},[0-9]{3})",
        r"Current.*?Detain[^0-9]*([0-9]{2,3},[0-9]{3})",
        r"Total.*?Detain[^0-9]*([0-9]{2,3},[0-9]{3})",
        r"([0-9]{2,3},[0-9]{3})\s*(?:individuals?|people|persons?)\s*(?:in|are)?\s*(?:ICE)?\s*(?:detention|detained|custody)",
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            pop = int(m.group(1).replace(",", ""))
            if 10000 < pop < 200000:  # sanity check
                print(f"  ✅  ICE detained: {pop:,}")
                return pop, datetime.now(timezone.utc).strftime("%Y-%m-%d")

    print("  ⚠️  Could not parse ICE population. Page may require JavaScript or login.")
    print("      Manual update: visit ice.gov/detain/detention-management")
    return None, None


# ── Main Update Logic ─────────────────────────────────────────────────────────

def run_update():
    print("=" * 60)
    print("  Prison Dashboard — Monthly Data Updater")
    print(f"  Running at: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    data = load_data()
    changes = []

    # ── 1. BOP Population ──────────────────────────────────────
    bop_pop, bop_date = fetch_bop_population()
    if bop_pop:
        old = data["bop"]["total_population"]
        if old != bop_pop:
            changes.append(f"BOP population: {old:,} → {bop_pop:,}")
        data["bop"]["total_population"] = bop_pop
        data["bop"]["last_fetched"] = bop_date

        # Also update the facility_types entry
        for ft in data["facility_types"]:
            if ft["type"] == "Federal Prisons (BOP)":
                ft["population"] = bop_pop
                break

        # Update headline stat
        total_old = data["headline_stats"]["total_incarcerated"]
        # Adjust total by the delta
        data["headline_stats"]["total_incarcerated"] = (
            total_old + (bop_pop - old)
        )
    else:
        print("  ℹ️  BOP population unchanged (fetch failed — keeping previous value)")

    # ── 2. ICE Detention ───────────────────────────────────────
    ice_pop, ice_date = fetch_ice_population()
    if ice_pop:
        old = data["ice"]["total_detained"]
        if old != ice_pop:
            changes.append(f"ICE detained: {old:,} → {ice_pop:,}")
        data["ice"]["total_detained"] = ice_pop
        data["ice"]["last_fetched"] = ice_date
        data["headline_stats"]["ice_detained_current"] = ice_pop

        # Also update facility_types entry
        for ft in data["facility_types"]:
            if ft["type"] == "Immigration (ICE)":
                ft["population"] = ice_pop
                break
    else:
        print("  ℹ️  ICE population unchanged (fetch failed — keeping previous value)")

    # ── 3. Update meta ─────────────────────────────────────────
    today = datetime.now(timezone.utc)
    data["_meta"]["last_updated"] = today.strftime("%Y-%m-%d")
    data["_meta"]["last_updated_by"] = "auto"
    # Next update = 1st of next month
    if today.month == 12:
        next_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month + 1, day=1)
    data["_meta"]["next_update"] = next_month.strftime("%Y-%m-%d")
    data["headline_stats"]["data_as_of"] = today.strftime("%B %Y")

    # ── 4. Save ────────────────────────────────────────────────
    save_data(data)

    # ── 5. Summary ────────────────────────────────────────────
    print("\n" + "=" * 60)
    if changes:
        print("  📊  Changes this month:")
        for c in changes:
            print(f"     • {c}")
    else:
        print("  📊  No data changes detected this month.")

    print("\n  ⚠️  MANUAL UPDATE REMINDER")
    print("  The following require manual review each month:")
    print("  • breaking_news[] — add/update news items in live_data.json")
    print("  • State populations — update annually each fall when BJS releases")
    print("  • State budgets — update after state legislative sessions")
    print("  • Federal budget figures — update when new appropriations pass")
    print("  • Committee chairs — update after elections/leadership changes")
    print("=" * 60)

    return len(changes)


if __name__ == "__main__":
    n = run_update()
    sys.exit(0)
