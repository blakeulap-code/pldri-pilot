#!/usr/bin/env python3

import argparse
import json
import re
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET


WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_JSON = WORKSPACE_ROOT / "src" / "data" / "pilotData.json"
PUBLIC_OUTPUT_JSON = WORKSPACE_ROOT / "public" / "data" / "pilotData.json"
OUTPUT_PHOTO_DIR = WORKSPACE_ROOT / "public" / "workbook-photos"
DEFAULT_WORKBOOK_GLOB = "LGU Schedules and Profiles for PLDI KII*.xlsx"

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}

INDICATOR_DEFS = [
    ("paradiplomacyIntensity", "Paradiplomacy intensity", "A"),
    ("economicDependenceOnForeignLinkedReceipts", "Foreign-linked receipts", "A"),
    ("lsrDependenceInverse", "Low self-reliance", "A"),
    ("foreignAidConcentration", "Aid concentration", "A"),
    ("strategicProximity", "Strategic proximity", "A"),
    ("economicEnclaves", "Economic enclaves", "A"),
    ("directForeignDonations", "Direct foreign donations", "A"),
    ("institutionalOpacity", "Institutional opacity", "B"),
    ("civicSpaceClosure", "Civic space pressure", "B"),
    ("politicalConcentrationDynasticShare", "Dynastic concentration", "B"),
    ("partyAlignment", "Party alignment", "B"),
    ("foiOrdinance", "FOI ordinance", "B"),
    ("narrativeAlignment", "Narrative alignment", "C"),
    ("currentForeignPresence", "Current foreign presence", "C"),
    ("reports", "Foreign-linked reporting", "C"),
]

PROFILE_COLS = {
    "A": "typology",
    "B": "islandGroup",
    "C": "region",
    "D": "name",
    "E": "province",
    "F": "type",
    "G": "incomeClass",
    "H": "totalScore",
    "I": "overallRank",
    "J": "flagA",
    "K": "flagB",
    "L": "flagC",
    "M": "abcCode",
    "N": "lceName",
    "P": "age",
    "Q": "term",
    "R": "background",
    "S": "shade",
    "T": "paradiplomacyIntensity",
    "U": "economicDependenceOnForeignLinkedReceipts",
    "V": "lsrDependenceInverse",
    "W": "foreignAidConcentration",
    "X": "strategicProximity",
    "Y": "economicEnclaves",
    "Z": "directForeignDonations",
    "AA": "institutionalOpacity",
    "AB": "civicSpaceClosure",
    "AC": "politicalConcentrationDynasticShare",
    "AD": "partyAlignment",
    "AE": "foiOrdinance",
    "AF": "narrativeAlignment",
    "AG": "currentForeignPresence",
    "AH": "reports",
    "AI": "domainAScore",
    "AJ": "domainBScore",
    "AK": "domainCScore",
    "AL": "sheetTotal",
    "AM": "vulnerabilityRationale",
    "AN": "engagementAnalysis",
}

MANUAL_OVERRIDES = {
    "Zamboanga City": {
        "lsrDependenceInverse": 0.796,
        "foiOrdinance": 0.0,
    },
    "Cebu": {
        "politicalConcentrationDynasticShare": 0.3,
    },
    "Marawi City": {
        "strategicProximity": 0.1,
    },
}


def slugify(value):
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")


def normalize_name(value):
    if not value:
        return ""
    cleaned = str(value).strip()
    cleaned = cleaned.replace("(Province)", "").replace("(Province/City)", "").strip()
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned


def read_workbook_parts(workbook_path):
    archive = zipfile.ZipFile(workbook_path)
    shared_strings = []
    if "xl/sharedStrings.xml" in archive.namelist():
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        for shared_item in shared_root.findall("main:si", NS):
            shared_strings.append(
                "".join(
                    node.text or ""
                    for node in shared_item.iter(
                        "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
                    )
                )
            )

    workbook_root = ET.fromstring(archive.read("xl/workbook.xml"))
    rels_root = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rels = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels_root}

    sheet_paths = {}
    for sheet in workbook_root.find("main:sheets", NS):
        rel_id = sheet.attrib[
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        ]
        target = rels[rel_id]
        if not target.startswith("xl/"):
            target = f"xl/{target}"
        sheet_paths[sheet.attrib["name"]] = target

    return archive, shared_strings, sheet_paths


def cell_value(cell, shared_strings):
    cell_type = cell.attrib.get("t")
    raw_value = cell.find("main:v", NS)
    if raw_value is None:
        inline = cell.find("main:is", NS)
        if inline is None:
            return None
        return "".join(
            node.text or ""
            for node in inline.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")
        )
    if cell_type == "s":
        return shared_strings[int(raw_value.text)]
    return raw_value.text


def read_sheet_rows(archive, shared_strings, sheet_path):
    root = ET.fromstring(archive.read(sheet_path))
    rows = []
    for row in root.findall(".//main:sheetData/main:row", NS):
        current = {}
        for cell in row.findall("main:c", NS):
            column = re.match(r"[A-Z]+", cell.attrib["r"]).group(0)
            current[column] = cell_value(cell, shared_strings)
        rows.append((int(row.attrib["r"]), current))
    return rows, root


def parse_float(value):
    if value in (None, "", "#REF!"):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def parse_int(value):
    number = parse_float(value)
    if number is None:
        return None
    return int(round(number))


def parse_flag(value):
    number = parse_float(value)
    return bool(number and number > 0)


def excel_date(value):
    number = parse_float(value)
    if number is None:
        return None
    return datetime(1899, 12, 30) + timedelta(days=number)


def format_day_label(value):
    parsed = excel_date(value)
    if parsed is None:
        return value if value is not None else ""
    return parsed.strftime("%d-%b (%a)")


def format_long_date(value):
    parsed = excel_date(value)
    if parsed is None:
        return value if value is not None else ""
    return parsed.strftime("%b %d, %Y").replace(" 0", " ")


def iso_date(value):
    parsed = excel_date(value)
    if parsed is None:
        return None
    return parsed.strftime("%Y-%m-%d")


def clean_text(value):
    if value is None:
        return ""
    cleaned = str(value).replace("\r\n", "\n").replace("\r", "\n")
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def clean_section_heading(text, name):
    if not text or not name:
        return text
    duplicated = f"{name}{name}"
    if text.startswith(duplicated):
        return text[len(name) :].strip()
    return text


def normalize_url(value):
    if not value:
        return ""
    stripped = str(value).strip()
    match = re.search(r"https?://\S+", stripped)
    if not match:
        return stripped
    return match.group(0)


def source_label(url):
    if not url:
        return "Source"
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def extract_master_report(profiles):
    for profile in profiles:
        analysis = profile.get("engagementAnalysis", "")
        if len(analysis) > 4000:
            return analysis
    return ""


def split_master_report(master_report, ordered_names):
    if not master_report:
        return {}
    sections = {}
    start_points = []
    cursor = 0
    for name in ordered_names:
        idx = master_report.find(name, cursor)
        if idx == -1:
            continue
        start_points.append((name, idx))
        cursor = idx + len(name)
    for index, (name, start) in enumerate(start_points):
        end = len(master_report)
        if index + 1 < len(start_points):
            end = start_points[index + 1][1]
        section = clean_section_heading(clean_text(master_report[start:end]), name)
        sections[name] = section
    return sections


def extract_profile_photos(archive, sheet_root, sheet_rows):
    rels_path = "xl/worksheets/_rels/sheet2.xml.rels"
    if rels_path not in archive.namelist():
        return {}

    sheet_rels_root = ET.fromstring(archive.read(rels_path))
    drawing_target = None
    for rel in sheet_rels_root:
        rel_type = rel.attrib["Type"]
        if rel_type.endswith("/drawing"):
            drawing_target = rel.attrib["Target"]
            break

    if not drawing_target:
        return {}

    drawing_path = drawing_target.replace("../", "xl/")
    drawing_root = ET.fromstring(archive.read(drawing_path))

    drawing_rels_path = (
        Path(drawing_path).parent / "_rels" / f"{Path(drawing_path).name}.rels"
    ).as_posix()
    drawing_rels_root = ET.fromstring(archive.read(drawing_rels_path))
    image_rels = {
        rel.attrib["Id"]: rel.attrib["Target"].replace("../", "xl/")
        for rel in drawing_rels_root
    }

    row_to_name = {
        row_index: normalize_name(row_cells.get("D")) for row_index, row_cells in sheet_rows
    }

    OUTPUT_PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    for existing_file in OUTPUT_PHOTO_DIR.glob("*"):
        if existing_file.is_file():
            existing_file.unlink()

    photo_map = {}
    for anchor in drawing_root.findall("xdr:oneCellAnchor", NS):
        anchor_row = int(anchor.find("xdr:from/xdr:row", NS).text) + 1
        blip = anchor.find(".//a:blip", NS)
        if blip is None:
            continue
        rel_id = blip.attrib[
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"
        ]
        image_path = image_rels.get(rel_id)
        profile_name = row_to_name.get(anchor_row)
        if not image_path or not profile_name:
            continue

        suffix = Path(image_path).suffix or ".png"
        file_name = f"{slugify(profile_name)}{suffix}"
        target_file = OUTPUT_PHOTO_DIR / file_name
        target_file.write_bytes(archive.read(image_path))
        photo_map[profile_name] = f"/workbook-photos/{file_name}"

    return photo_map


def parse_schedule(rows):
    primary = []
    reserve = []
    section = "primary"

    for row_index, row in rows[1:]:
        first_value = row.get("A")
        if not any(value not in (None, "") for value in row.values()):
            continue

        if first_value == "Optional LGUs (if included later)":
            section = "reserve_header"
            continue

        if section == "reserve_header":
            section = "reserve"
            continue

        if section == "primary":
            primary.append(
                {
                    "id": f"primary-{len(primary) + 1}",
                    "row": row_index,
                    "dateLabel": format_day_label(row.get("A")),
                    "dateIso": iso_date(row.get("A")),
                    "lgu": normalize_name(row.get("B")),
                    "province": clean_text(row.get("C")),
                    "typology": clean_text(row.get("D")),
                    "mode": clean_text(row.get("E")),
                    "time": clean_text(row.get("F")),
                    "personnel": clean_text(row.get("G")),
                    "notes": clean_text(row.get("H")),
                    "bucket": "primary",
                }
            )
            continue

        reserve.append(
            {
                "id": f"reserve-{len(reserve) + 1}",
                "row": row_index,
                "status": clean_text(row.get("A")),
                "team": clean_text(row.get("B")),
                "lgu": normalize_name(row.get("C")),
                "province": clean_text(row.get("D")),
                "typology": clean_text(row.get("E")),
                "mode": clean_text(row.get("F")),
                "time": clean_text(row.get("G")),
                "notes": clean_text(row.get("H")),
                "bucket": "reserve",
            }
        )

    return primary, reserve


def parse_profiles(rows, photo_map):
    profiles = []
    ordered_names = []

    for row_index, row in rows[1:]:
        name = normalize_name(row.get("D"))
        if not name:
            continue

        profile = {"id": slugify(name), "row": row_index, "name": name}
        for column, field_name in PROFILE_COLS.items():
            if column == "D":
                continue
            value = row.get(column)
            if field_name in {
                "totalScore",
                "domainAScore",
                "domainBScore",
                "domainCScore",
                "sheetTotal",
            }:
                profile[field_name] = parse_float(value)
            elif field_name in {"overallRank", "abcCode"}:
                profile[field_name] = parse_int(value)
            elif field_name in {"flagA", "flagB", "flagC"}:
                profile[field_name] = parse_flag(value)
            elif field_name in {indicator[0] for indicator in INDICATOR_DEFS}:
                profile[field_name] = parse_float(value)
            else:
                profile[field_name] = clean_text(value)

        overrides = MANUAL_OVERRIDES.get(name, {})
        for key, override_value in overrides.items():
            if profile.get(key) is None:
                profile[key] = override_value

        profile["imageUrl"] = photo_map.get(name, "")
        profile["displayScore"] = round(profile.get("totalScore") or 0, 4)
        profile["domainScores"] = {
            "A": profile.get("domainAScore") or 0,
            "B": profile.get("domainBScore") or 0,
            "C": profile.get("domainCScore") or 0,
        }
        profile["flags"] = {
            "A": profile.get("flagA", False),
            "B": profile.get("flagB", False),
            "C": profile.get("flagC", False),
        }
        profile["indicators"] = {
            key: profile.get(key) for key, _, _ in INDICATOR_DEFS
        }

        ordered_names.append(name)
        profiles.append(profile)

    master_report = extract_master_report(profiles)
    master_sections = split_master_report(master_report, ordered_names)
    for profile in profiles:
        analysis = profile.get("engagementAnalysis", "")
        if not analysis or len(analysis) > 4000:
            profile["engagementAnalysis"] = master_sections.get(profile["name"], analysis)

    return profiles


def parse_news(rows, sheet_root, archive):
    rels_root = ET.fromstring(archive.read("xl/worksheets/_rels/sheet3.xml.rels"))
    rels = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels_root}
    hyperlinks = {}
    for hyperlink in sheet_root.findall(".//main:hyperlinks/main:hyperlink", NS):
        ref = hyperlink.attrib.get("ref")
        rel_id = hyperlink.attrib.get(
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        )
        hyperlinks[ref] = rels.get(rel_id, "")

    grouped = {}
    all_items = []
    for row_index, row in rows[1:]:
        name = normalize_name(row.get("A"))
        title = clean_text(row.get("B"))
        if not name or not title:
            continue
        link_ref = f"D{row_index}"
        url = normalize_url(hyperlinks.get(link_ref) or row.get("D"))
        item = {
            "id": f"news-{row_index}",
            "lgu": name,
            "title": title,
            "dateLabel": format_long_date(row.get("C")),
            "dateIso": iso_date(row.get("C")),
            "url": url,
            "sourceLabel": source_label(url),
        }
        grouped.setdefault(name, []).append(item)
        all_items.append(item)

    return grouped, all_items


def resolve_workbook_path(argument_value):
    if argument_value:
        return Path(argument_value).expanduser().resolve()

    home = Path.home()
    candidates = sorted((home / "Downloads").glob(DEFAULT_WORKBOOK_GLOB))
    if not candidates:
        raise FileNotFoundError(
            "No workbook path was provided and no matching file was found in Downloads."
        )
    return candidates[-1]


def main():
    parser = argparse.ArgumentParser(
        description="Sync the PLDRI workbook into app-ready JSON and photo assets."
    )
    parser.add_argument("workbook", nargs="?", help="Path to the exported XLSX workbook")
    args = parser.parse_args()

    workbook_path = resolve_workbook_path(args.workbook)
    if not workbook_path.exists():
        raise FileNotFoundError(f"Workbook not found: {workbook_path}")

    archive, shared_strings, sheet_paths = read_workbook_parts(workbook_path)

    schedule_rows, schedule_root = read_sheet_rows(
        archive, shared_strings, sheet_paths["Field Deployment Schedule"]
    )
    profile_rows, profile_root = read_sheet_rows(
        archive, shared_strings, sheet_paths["Selected LGUs"]
    )
    news_rows, news_root = read_sheet_rows(archive, shared_strings, sheet_paths["News"])

    photo_map = extract_profile_photos(archive, profile_root, profile_rows)
    primary_schedule, reserve_schedule = parse_schedule(schedule_rows)
    profiles = parse_profiles(profile_rows, photo_map)
    news_by_lgu, all_news = parse_news(news_rows, news_root, archive)

    output = {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace(
            "+00:00", "Z"
        ),
        "sourceWorkbook": str(workbook_path),
        "summary": {
            "profileCount": len(profiles),
            "primaryTripCount": len(primary_schedule),
            "reserveTripCount": len(reserve_schedule),
            "newsCount": len(all_news),
        },
        "schedules": {
            "primary": primary_schedule,
            "reserve": reserve_schedule,
        },
        "profiles": profiles,
        "newsByLgu": news_by_lgu,
        "allNews": all_news,
    }

    output_text = json.dumps(output, indent=2, ensure_ascii=True) + "\n"

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(output_text)

    PUBLIC_OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT_JSON.write_text(output_text)

    print(f"Synced workbook: {workbook_path}")
    print(f"Wrote data: {OUTPUT_JSON}")
    print(f"Wrote public data: {PUBLIC_OUTPUT_JSON}")
    print(f"Exported photos: {OUTPUT_PHOTO_DIR}")


if __name__ == "__main__":
    main()
