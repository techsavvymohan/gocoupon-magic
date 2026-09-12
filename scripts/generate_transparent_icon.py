import base64
import io
import os
from PIL import Image

def generate_icons():
    logo_path = os.path.join("public", "gc-logo.webp")
    if not os.path.exists(logo_path):
        print("Error: logo not found")
        return

    img = Image.open(logo_path).convert("RGBA")
    bbox = img.getbbox()
    print("Artwork bbox:", bbox)
    cropped = img.crop(bbox)
    cw, ch = cropped.size
    print(f"Cropped artwork size: {cw}x{ch}")

    # Generate transparent background square canvas (512x512)
    canvas_size = 512
    scale = 470 / cw
    target_w = int(cw * scale)
    target_h = int(ch * scale)
    offset_x = (canvas_size - target_w) // 2
    offset_y = (canvas_size - target_h) // 2

    # High quality PNG buffer of the cropped logo
    buf = io.BytesIO()
    cropped.save(buf, format="PNG", optimize=True)
    b64_data = base64.b64encode(buf.getvalue()).decode("utf-8")

    # Pure transparent background SVG with square viewBox
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_size} {canvas_size}" width="100%" height="100%">
  <!-- GoCoupon Transparent Background Vector Icon -->
  <image href="data:image/png;base64,{b64_data}" x="{offset_x}" y="{offset_y}" width="{target_w}" height="{target_h}" preserveAspectRatio="xMidYMid meet" />
</svg>
"""

    os.makedirs(os.path.join("public", "icons"), exist_ok=True)
    os.makedirs("extension", exist_ok=True)

    # 1. Save transparent SVG icon
    svg_destinations = [
        os.path.join("public", "icons", "icon.svg"),
        os.path.join("extension", "icon.svg"),
        os.path.join("public", "favicon.svg"),
    ]
    for dest in svg_destinations:
        with open(dest, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"Written: {dest}")

    # 2. Also generate transparent background PNG icons at standard sizes (16, 32, 48, 128)
    # On a transparent canvas
    for size in [16, 32, 48, 128]:
        transparent_canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        # Scale cropped logo to fit within canvas with small margin
        inner_max = int(size * 0.92) if size > 16 else 16
        inner_scale = min(inner_max / cw, inner_max / ch)
        inner_w = max(1, int(cw * inner_scale))
        inner_h = max(1, int(ch * inner_scale))
        resized_logo = cropped.resize((inner_w, inner_h), Image.Resampling.LANCZOS)
        
        pos_x = (size - inner_w) // 2
        pos_y = (size - inner_h) // 2
        transparent_canvas.paste(resized_logo, (pos_x, pos_y), resized_logo)

        # Save transparent icons
        dest_pub = os.path.join("public", "icons", f"icon_{size}.png")
        dest_ext = os.path.join("extension", f"icon_{size}.png")
        transparent_canvas.save(dest_pub, format="PNG")
        transparent_canvas.save(dest_ext, format="PNG")
        
        if size == 128:
            transparent_canvas.save(os.path.join("extension", "icon.png"), format="PNG")
            transparent_canvas.save(os.path.join("public", "icons", "icon.png"), format="PNG")

        print(f"Generated transparent {size}x{size} PNG icons")

if __name__ == "__main__":
    generate_icons()
