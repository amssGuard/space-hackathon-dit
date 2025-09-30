import math, os, sys, argparse
from PIL import Image
from pathlib import Path
from xml.etree import ElementTree as ET
from xml.dom import minidom
from tqdm import tqdm
Image.MAX_IMAGE_PIXELS = None


def compute_max_level(width, height):
    max_dim = max(width,height)
    if max_dim<=1 :
        return 0
    return math.ceil(math.log2(max_dim))

def build_level_image(src_img, level_index, max_level):
    if level_index == max_level:
        return src_img
    
    scale = 2 ** (max_level - level_index)
    new_w = math.ceil(src_img.width / scale)
    new_h = math.ceil(src_img.height / scale)
    return src_img.resize((new_w, new_h), Image.LANCZOS)

def save_tiles_forlevel(img,out_dir,level,tile_size, fmt, quality):
    cols = math.ceil(img.width / tile_size)
    rows = math.ceil(img.height / tile_size)
    level_dir = os.path.join(out_dir,str(level))
    os.makedirs(level_dir,exist_ok=True)
    for row in range(rows):
        for col in range(cols):
            left = col * tile_size
            upper = row * tile_size
            right = min(left + tile_size, img.width)
            lower = min(upper + tile_size, img.height)
            tile = img.crop((left, upper, right, lower))
            if fmt.lower() in ("jpg","jpeg") and tile.mode in ("RGBA","LA"):
                bg = Image.new("RGB", tile_size, (255,255,255))
                bg.paste(tile, mask = tile.split()[-1])
                title = bg
            elif fmt.lower() in ("jpg","jpeg"):
                tile = tile.convert("RGB")
            filename = os.path.join(level_dir,f"{col}_{row}.{fmt}")
            if fmt.lower() in ("jpg","jpeg"):
                tile.save(filename, quality=quality)
            else:
                tile.save(filename)
    return cols, rows

def write_dzi_xml(output_prefix,tile_size, overlap, fmt, width, height):
    image = ET.Element("Image",TileSize=str(tile_size), Overlap=str(overlap),Format=fmt, xmlns="http://schemas.microsoft.com/deepzoom/2008")
    size = ET.SubElement(image, "Size",Width=str(width),Height=str(height))
    xml_str = ET.tostring(image, encoding="utf-8")

    parsed = minidom.parseString(xml_str)
    pretty = parsed.toprettyxml(indent=" ",encoding="utf-8")
    dzi_path = f"{output_prefix}.dzi"
    with open(dzi_path,"wb") as f:
        f.write(pretty)
    print(f"Wrote DZI descriptor:{dzi_path}")


def main():
    parser = argparse.ArgumentParser(description="pillow based dz")
    parser.add_argument("input", help="Input image file(tif/jpg/png)")
    parser.add_argument("output_prefix", help = "Output prefix(creates prefix.dzi and prefix_files/)")
    parser.add_argument("--tile-size", type = int, default=256)
    parser.add_argument("--overlap", type = int, default= 0)
    parser.add_argument("--format",default="jpg",choices=["jpg","jpeg","png"])
    parser.add_argument("--quality", type = int, default=90, help="JPEG quality (if jpg)")
    parser.add_argument("--skip-existing", action = "store_true", help = "Don't regenerate tiles if folder exists")
    
    args = parser.parse_args()
    input_path = Path(args.input)
    if not input_path.exists():
        print("File not found:", input_path)
        sys.exit(1)

    out_prefix = args.output_prefix
    out_folder = f"{out_prefix}_files"
    if os.path.exists(out_folder) and args.skip_existing:
        print("Output folder exists, Skipping (ues --skip-existing to avoid overwriting)")
        sys.exit(0)
        if os.path.exists(out_folder):
            print("Removing existing output folder (regenerating)...")
            import shutil
            shutil.rmtree(out_folder)

    img = Image.open(str(input_path))
    img = img.convert("RGBA") if img.mode in ("P","LA","RGBA") else img.convert("RGB")
    width,height = img.width, img.height
    print(f"Loaded {input_path} size = {width}x{height}")

    max_level = compute_max_level(width, height)
    print(f"Computed max_level = {max_level} (levls 0..{max_level})")

    os.makedirs(out_folder, exist_ok=True)
    for level in range(0, max_level + 1):
        level_img = build_level_image(img,level,max_level)
        cols, rows = save_tiles_forlevel(img, out_folder, level,args.tile_size,args.format, args.quality)
    write_dzi_xml(out_prefix, args.tile_size, args.overlap, args.format, width, height)

if __name__ == "__main__":
    main()
