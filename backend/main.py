from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3, json, time

app = FastAPI()
app.add_middleware(CORSMiddleware,allow_origins=["*"],  # or ["http://localhost:5173"] for your React frontend
    allow_credentials=True,
    allow_methods=["*"],   # <-- this allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],)

DB = "annotations.db"

def init_db():
    conn = sqlite3.connect(DB)
    conn.execute("""CREATE TABLE IF NOT EXISTS annotations( id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT, geometry TEXT, created_at INTEGER)""")
    conn.commit()
    conn.close()

class Annotation(BaseModel):
    label: str
    geometry: dict

@app.on_event("startup")
def startup():
    init_db()

@app.post("/annotations")
def create_annotation(a: Annotation):
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute("INSERT INTO annotations (label, geometry, created_at) VALUES (?,?,?)",(a.label,json.dumps(a.geometry), int(time.time())))
    conn.commit()
    id = cur.lastrowid
    conn.close()
    return {"id": id}

@app.get("/annotations")
def list_annotations():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    res = cur.execute("SELECT id, label, geometry, created_at FROM annotations").fetchall()
    conn.close()
    return [{"id": r[0], "label":r[1], "geometry":json.loads(r[2]), "created_at": r[3]} for r in res]
