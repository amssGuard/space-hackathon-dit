from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import time
import json

app = Flask(__name__)
CORS(app)  # Allow all origins; customize if needed

# Database config (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///annotations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ORM Model
class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    label = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
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
@app.route("/annotations", methods=["POST"])
def create_annotation():
    data = request.get_json()
    annotation = Annotation(
        label=data["label"],
        geometry=json.dumps(data["geometry"]),
        description=data.get("description", ""),
        created_at=int(time.time())
    )
    db.session.add(annotation)
    db.session.commit()
    return jsonify({"id": annotation.id})

@app.route("/annotations", methods=["GET"])
def list_annotations():
    annotations = Annotation.query.all()
    return jsonify([a.to_dict() for a in annotations])

if __name__ == "__main__":
    app.run(debug=True)
