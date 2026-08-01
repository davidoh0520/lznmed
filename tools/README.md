# tools/ — Utility Scripts

## `audit_live_product_images_for_chinese.py`

Scans **only the images referenced by live product data sources** and reports
any that contain Chinese (CJK) text. Unlinked or unreferenced image files are
excluded.

### Why this exists

Product images sourced from suppliers may include Chinese-language annotations
(text overlays, watermarks, spec callouts). This script lets you quickly
identify which images need to be replaced or edited before they reach customers.

### Dependencies

#### 1. Tesseract OCR + Chinese language packs

**macOS (Homebrew)**

```bash
brew install tesseract tesseract-lang
```

**Ubuntu / Debian**

```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-chi-tra
```

**Windows** — download the installer from
<https://github.com/UB-Mannheim/tesseract/wiki> and tick the Simplified Chinese
and Traditional Chinese language packs during setup.

#### 2. Python packages

```bash
pip install pillow pytesseract
```

Python 3.9 or later is required.

### How to run

From the repository root:

```bash
python tools/audit_live_product_images_for_chinese.py
```

The script will:

1. Discover every image path referenced by the current product data sources:
   - `frames/products.js`
   - `tools/catalog-products.js`
   - `tools/reading-glasses-category.js`
   - `tools/category-overrides.js`
   - `devices/*-data.js`
2. Resolve each path to a file on disk; skip any that are missing.
3. Run OCR on the resolved images.
4. Write a CSV report and print a summary count.

### Expected output

```
reports/live-product-images-chinese.csv
```

Columns:

| Column | Description |
|---|---|
| `model` | Product model identifier (inferred from surrounding source context) |
| `product_name` | Product name in English (inferred from surrounding source context) |
| `image_path` | Image path as it appears in the source file |
| `source_file` | Source file that references the image |
| `detected_chinese_sample` | First ≤ 80 CJK characters detected by OCR |

The `reports/` directory is created automatically if it does not already exist.
