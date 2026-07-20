from pathlib import Path
from PIL import Image
bad=[];sizes={}
for fp in Path('assets').rglob('*'):
 if fp.suffix.lower() not in {'.jpg','.jpeg','.png','.webp'}:continue
 try:
  with Image.open(fp) as im:im.verify();sizes[im.size]=sizes.get(im.size,0)+1
 except Exception as e:bad.append((str(fp),str(e)))
print('bad_images',len(bad));print('image_sizes',sorted(sizes.items(),key=lambda x:-x[1])[:8])
if bad:
 print(bad);raise SystemExit(1)
