from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import time
import json
import pyvips
import os
import uuid

app = Flask(__name__)
CORS(app)  # Allow all origins; customize if needed
# Where to store converted images
OUTPUT_DIR = "../converted_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)
# Database config (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///annotations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ORM Model
class TiffRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.String(36), unique=True, nullable=False)
    name = db.Column(db.String(256), nullable=False)
    

    def __repr__(self):
        return f"<TiffRecord {self.name}>"

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    label = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    tiff_record_id = db.Column(db.Integer, db.ForeignKey("tiff_record.file_id"), nullable=False)
    geometry = db.Column(db.Text, nullable=False)  # store as JSON string
    created_at = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "geometry": json.loads(self.geometry),
            "created_at": self.created_at,
        }

    
# Initialize DB
with app.app_context():
    db.create_all()

# Routes
@app.route("/annotations/<string:tiff_id>", methods=["POST"])
def create_annotation(tiff_id):
    data = request.get_json()
    annotation = Annotation(
        label=data["label"],
        geometry=json.dumps(data["geometry"]),
        description=data.get("description", ""),
        tiff_record_id=tiff_id,
        created_at=int(time.time())
    )
    db.session.add(annotation)
    db.session.commit()
    return jsonify({"id": annotation.id})

@app.route("/annotations/<string:tiff_id>", methods=["GET"])
def list_annotations(tiff_id):
    annotations = Annotation.query.filter_by(tiff_record_id=tiff_id).all()
    return jsonify([a.to_dict() for a in annotations])


# --- Directories ---
TILES_DIR = "../frontend/public/uploads/tiles"
os.makedirs(TILES_DIR, exist_ok=True)

# --- Serve tiles & dzi as static ---
# @app.route("/tiles/<path:filename>")
# def serve_tiles(filename):
#     return send_from_directory(TILES_DIR, filename)


# --- Upload endpoint ---
@app.route("/convert-tiff/", methods=["POST"])
def upload_tif():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename.lower().endswith((".tif", ".tiff")):
        return jsonify({"error": "Only .tif/.tiff files allowed"}), 400

    name = request.form.get("name", file.filename)
    try:
        # Unique ID for each upload
        file_id = str(uuid.uuid4())
        os.makedirs(os.path.join(TILES_DIR, f"{file_id}"), exist_ok=True)
        tif_path = os.path.join(TILES_DIR, f"{file_id}/{file_id}.tif")
        dzi_base = os.path.join(TILES_DIR, f"{file_id}/{file_id}")

        # Save uploaded file
        file.save(tif_path)

        # Convert TIFF → DZI
        image = pyvips.Image.new_from_file(tif_path, access="sequential")
        image.dzsave(dzi_base)

        # Remove original TIFF
        os.remove(tif_path)

        # Record in DB
        record = TiffRecord(file_id=file_id, name=file.filename)
        db.session.add(record)
        db.session.commit()

        # Return DZI URL
        return jsonify({
            "dziUrl": f"http://localhost:5173/uploads/tiles/{file_id}/{file_id}.dzi"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tiffs", methods=["GET"])
def list_tiffs():
    records = TiffRecord.query.all()
    return jsonify([{"id": r.id, "file_id": r.file_id, "name": r.name} for r in records])

if __name__ == "__main__":
    app.run(debug=True)
