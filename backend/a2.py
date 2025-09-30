import os
import uuid
from flask import Flask, request, jsonify
import pyvips

app = Flask(__name__)

# Where to store converted images
OUTPUT_DIR = "converted_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route("/convert-tiff", methods=["POST"])
def convert_tiff():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename.lower().endswith(".tiff"):
        return jsonify({"error": "Only .tiff files allowed"}), 400

    try:
        # Unique folder for this upload
        folder_id = str(uuid.uuid4())
        save_dir = os.path.join(OUTPUT_DIR, folder_id)
        os.makedirs(save_dir, exist_ok=True)

        # Save uploaded file temporarily
        tiff_path = os.path.join(save_dir, file.filename)
        file.save(tiff_path)

        # Open with pyvips (TIFF may have multiple pages)
        image = pyvips.Image.new_from_file(tiff_path, access="sequential")

        # If multipage TIFF -> pyvips loads as multipage band image
        # Split pages into separate images
        pages = image.get("n-pages") if image.get_typeof("n-pages") else 1

        saved_files = []
        for i in range(pages):
            page = pyvips.Image.new_from_file(tiff_path, page=i, access="sequential")
            out_path = os.path.join(save_dir, f"page_{i+1}.jpg")
            page.write_to_file(out_path)
            saved_files.append(out_path)

        return jsonify({
            "status": "success",
            "output_folder": save_dir,
            "files": saved_files
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
