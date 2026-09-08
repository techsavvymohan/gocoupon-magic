"""
Convert E:\\Gocoupon_web\\gocoupon-magic\\public\\gc-logo.webp into an exact, pristine SVG favicon.
Generates:
1. public/favicon.svg (Square 512x512 canvas for browser tabs / favicons)
2. public/gc-logo.svg (778x368 native resolution SVG)
"""
import base64
import io
import os
from PIL import Image

def main():
    logo_path = os.path.join("public", "gc-logo.webp")
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found!")
        return

    # Read original WebP bytes
    with open(logo_path, "rb") as f:
        webp_bytes = f.read()

    webp_b64 = base64.b64encode(webp_bytes).decode("utf-8")

    # Also convert to PNG for maximum cross-browser favicon compatibility (Safari/Firefox/Chrome)
    img = Image.open(logo_path).convert("RGBA")
    png_io = io.BytesIO()
    img.save(png_io, format="PNG", optimize=True)
    png_bytes = png_io.getvalue()
    png_b64 = base64.b64encode(png_bytes).decode("utf-8")

    # Dimensions
    orig_w, orig_h = img.size  # 778 x 368

    # 1. Native resolution SVG (778 x 368)
    native_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {orig_w} {orig_h}" width="{orig_w}" height="{orig_h}">
  <image href="data:image/png;base64,{png_b64}" width="{orig_w}" height="{orig_h}" preserveAspectRatio="xMidYMid meet" />
</svg>
"""
    with open(os.path.join("public", "gc-logo.svg"), "w", encoding="utf-8") as f:
        f.write(native_svg)
    print(f"Generated public/gc-logo.svg ({orig_w}x{orig_h})")

    # 2. Square Favicon SVG (512 x 512)
    # Fit logo comfortably within 512x512 with safe padding (width = 480, height = 480 * 368 / 778 = 227)
    fav_size = 512
    target_w = 480
    target_h = int(target_w * (orig_h / orig_w))
    offset_x = (fav_size - target_w) // 2
    offset_y = (fav_size - target_h) // 2

    favicon_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fav_size} {fav_size}" width="100%" height="100%">
  <!-- Exact GoCoupon Brand Favicon (Source: public/gc-logo.webp) -->
  <image href="data:image/png;base64,{png_b64}" x="{offset_x}" y="{offset_y}" width="{target_w}" height="{target_h}" preserveAspectRatio="xMidYMid meet" />
</svg>
"""
    with open(os.path.join("public", "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(favicon_svg)
    print(f"Generated public/favicon.svg ({fav_size}x{fav_size})")

if __name__ == "__main__":
    main()
