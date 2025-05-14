from PIL import Image
import os

def resize_image(path, output_path):
    img = Image.open(path)
    img = img.resize((800, 800))
    img.save(output_path)

def apply_watermark(path, output_path):
    img = Image.open(path).convert("RGBA")
    watermark = Image.new("RGBA", img.size)
    # Simple transparent watermark
    for x in range(img.size[0]):
        for y in range(img.size[1]):
            watermark.putpixel((x, y), (0, 0, 0, 0))
    img = Image.alpha_composite(img, watermark)
    img.convert("RGB").save(output_path, "JPEG")

def detect_content(path):
    # Simulación
    return "safe"
