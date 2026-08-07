#!/usr/bin/env python3
"""
audit_live_product_images_for_chinese.py

Discovers images referenced by live product data sources, runs OCR on each
file that exists on disk, and reports any that contain Chinese (CJK) text.

Output: reports/live-product-images-chinese.csv

Dependencies:
    pip install pillow pytesseract
    # macOS:  brew install tesseract tesseract-lang
    # Ubuntu: sudo apt-get install -y tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-chi-tra
"""

import csv
import re
import sys
from pathlib import Path

try:
    from PIL import Image
    import pytesseract
except ImportError:
    sys.exit(
        "ERROR: Required packages missing.\n"
        "Install them with: pip install pillow pytesseract\n"
        "Also install Tesseract + Chinese language packs (see tools/README.md)."
    )

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]

# Product data sources whose images are currently used on live pages.
# Paths that start with "/" are resolved relative to ROOT.
# Paths that do NOT start with "/" are resolved relative to the source file's
# own directory (mirrors how the browser resolves static asset URLs).
CANDIDATE_FILES = [
    ROOT / "frames" / "products.js",
    ROOT / "tools" / "catalog-products.js",
    ROOT / "tools" / "reading-glasses-category.js",
    ROOT / "tools" / "category-overrides.js",
] + sorted((ROOT / "devices").glob("*-data.js"))

# CJK Unified Ideographs (U+4E00–U+9FFF) covers the vast majority of
# simplified and traditional Chinese characters used in product text.
CJK_RE = re.compile(r"[\u4e00-\u9fff]+")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def read_text(fp: Path) -> str:
    try:
        return fp.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def extract_image_paths(source_text: str) -> set:
    """
    Extract every image asset path referenced in *source_text*.

    Two strategies are combined:

    1. **Quoted-string paths** — captures any quoted value that ends in an
       image extension (handles most catalog / frames / reading-glasses files).

    2. **Template-literal asset helpers** — some device data files define:
           const asset = model => `/prefix/${model}.webp`
       and then call ``asset(model)`` where ``model`` comes from a nearby
       ``model: "VALUE"`` property.  The regex approach cannot evaluate these
       JavaScript expressions, so we extract the prefix + suffix from the
       template and expand every ``model:`` string value found in the same
       file.
    """
    paths: set = set()

    # Strategy 1: quoted / backtick literal paths
    quoted_pat = re.compile(
        r'''["'`]((?:/[^"'`\n]+|(?:assets|devices|tools|frames)[^"'`\n]+))'''
        r'''\.(?:webp|png|jpe?g|avif)["'`]''',
        re.IGNORECASE,
    )
    for m in quoted_pat.finditer(source_text):
        candidate = m.group(1)
        # Skip JavaScript template-literal interpolations like `/path/${model}.webp`
        if "${" in candidate:
            continue
        paths.add(candidate + "." + m.group(0).rsplit(".", 1)[1].rstrip("\"'`"))

    # Strategy 2: expand asset-helper template literals
    # Pattern: const asset = model => `/some/path/${model}.webp`
    tmpl_pat = re.compile(
        r'''const\s+\w+\s*=\s*\w+\s*=>\s*`([^`]*)\$\{[^}]+\}([^`]*)`''',
    )
    model_val_pat = re.compile(r'''"?model"?\s*:\s*["']([^"'\n]+)["']''')
    for tmpl_m in tmpl_pat.finditer(source_text):
        prefix = tmpl_m.group(1)
        suffix = tmpl_m.group(2)
        # Only process templates that produce image paths
        if not re.search(r'\.(?:webp|png|jpe?g|avif)$', suffix, re.IGNORECASE):
            continue
        for val_m in model_val_pat.finditer(source_text):
            raw_model = val_m.group(1)
            # Skip option-level models that embed a dash-separated code suffix
            # (e.g. "LY-21C-SNELLEN") — device image uses the base model only.
            # We keep the value as-is and let the filesystem check skip it if
            # the file doesn't exist.
            paths.add(prefix + raw_model + suffix)

    return paths


def resolve_path(image_path: str, source_file: Path) -> Path:
    """
    Resolve an image path string to a filesystem Path.

    - Absolute paths (starting with "/") are joined to ROOT.
    - Relative paths are resolved relative to the source file's directory.
    """
    if image_path.startswith("/"):
        return ROOT / image_path.lstrip("/")
    return source_file.parent / image_path


def infer_context(source_text: str, image_path: str) -> tuple:
    """Return (model, product_name) by looking at the text near the image reference."""
    idx = source_text.find(image_path)
    if idx < 0:
        return "", ""
    window = source_text[max(0, idx - 1500): idx + 300]

    model = ""
    name = ""

    m = re.search(r'"?model"?\s*:\s*["\']([^"\']+)["\']', window)
    if m:
        model = m.group(1)

    for key in ("nameEn", "productTitle", "title"):
        n = re.search(rf'"?{key}"?\s*:\s*["\']([^"\']+)["\']', window)
        if n:
            name = n.group(1)
            break

    return model, name


def ocr_has_chinese(img_path: Path):
    """
    Run Tesseract OCR on *img_path* with English + Simplified/Traditional
    Chinese models and return (True, sample_text) if CJK characters are found,
    otherwise (False, "").
    """
    try:
        with Image.open(img_path) as im:
            text = pytesseract.image_to_string(im, lang="eng+chi_sim+chi_tra")
        hits = CJK_RE.findall(text or "")
        if hits:
            sample = "".join(hits)[:80]
            return True, sample
        return False, ""
    except pytesseract.TesseractNotFoundError:
        sys.exit(
            "ERROR: Tesseract not found.\n"
            "Install it and Chinese language packs (see tools/README.md)."
        )
    except Exception as exc:  # noqa: BLE001
        return False, f"OCR_ERROR:{exc}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # ------------------------------------------------------------------
    # 1. Collect all (image_path_string, source_file, source_text) triples
    # ------------------------------------------------------------------
    raw_refs: list[tuple[str, Path, str]] = []
    for source_file in CANDIDATE_FILES:
        if not source_file.exists():
            continue
        text = read_text(source_file)
        for img in extract_image_paths(text):
            raw_refs.append((img, source_file, text))

    # De-duplicate: keep first source reference for each unique image string.
    seen: dict[str, tuple[Path, str]] = {}
    for img, src, txt in raw_refs:
        if img not in seen:
            seen[img] = (src, txt)

    print(f"[info] {len(seen)} unique image references found across source files.")

    # ------------------------------------------------------------------
    # 2. Resolve paths; skip missing files
    # ------------------------------------------------------------------
    resolved: list[tuple[Path, str, Path, str]] = []  # (fs_path, img_str, src_file, src_text)
    missing = 0
    for img_str, (src_file, src_text) in seen.items():
        fs_path = resolve_path(img_str, src_file)
        if not fs_path.exists():
            missing += 1
            continue
        resolved.append((fs_path, img_str, src_file, src_text))

    print(f"[info] {len(resolved)} files found on disk, {missing} missing (skipped).")

    # ------------------------------------------------------------------
    # 3. OCR each image and collect those with Chinese text
    # ------------------------------------------------------------------
    hits: list[dict] = []
    for idx, (fs_path, img_str, src_file, src_text) in enumerate(resolved, 1):
        print(f"  [{idx}/{len(resolved)}] {img_str}", end="", flush=True)
        has_zh, sample = ocr_has_chinese(fs_path)
        if has_zh:
            model, name = infer_context(src_text, img_str)
            hits.append(
                {
                    "model": model,
                    "product_name": name,
                    "image_path": img_str,
                    "source_file": str(src_file.relative_to(ROOT)),
                    "detected_chinese_sample": sample,
                }
            )
            print(f"  ← CHINESE DETECTED")
        else:
            print()

    # ------------------------------------------------------------------
    # 4. Write CSV report
    # ------------------------------------------------------------------
    report_dir = ROOT / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    out_csv = report_dir / "live-product-images-chinese.csv"

    fieldnames = ["model", "product_name", "image_path", "source_file", "detected_chinese_sample"]
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(hits)

    print(f"\n[done] {len(hits)} image(s) with Chinese text found.")
    print(f"[done] Report written to: {out_csv.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
