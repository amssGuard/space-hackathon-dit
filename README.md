# NASA Image Explorer Hackathon Project

## Overview
This project is a web application that allows users to **explore massive NASA image datasets**, zoom in/out, and **add labels (annotations)** to points on the images. Annotations are saved in a backend database and reloaded automatically.

- **Frontend:** React + OpenSeadragon
- **Backend:** FastAPI + SQLite
- **Data:** Deep Zoom Images (DZI) from NASA datasets

---

## Project Structure

space-hackathon/
│
├── backend/
│ ├── main.py # FastAPI backend code
│ ├── annotations.db # SQLite DB (auto-created)
│ └── requirements.txt # Backend dependencies
│
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ └── components/
│ │ └── OpenSeadragonViewer.jsx
│ ├── public/
│ │ └── tiles/ # Place DZI tiles here
│ └── package.json
│
└── README.md


---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- Recommended: Git (to clone repo)

---

## Backend Setup (FastAPI + SQLite)

1. Open terminal and navigate to backend folder:

```bash
cd space-hackathon/backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --port 8000

cd space-hackathon/frontend
npm install
npm run dev


#To kill the process
lsof -i :8000
kill -9 <PID>
```
