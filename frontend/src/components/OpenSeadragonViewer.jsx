import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import OpenSeadragon from "openseadragon";

// Example React overlay component
const OverlayLabel = ({ label, description, x, y, dziUrl }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const previewRef = useRef(null);
  const previewViewer = useRef(null);

  useEffect(() => {
    if (isPopupOpen && previewRef.current && !previewViewer.current) {
      const v = OpenSeadragon({
        element: previewRef.current,
        prefixUrl: "/openseadragon/images/",
        tileSources: dziUrl,
        showNavigator: false,
        showNavigationControl: false,
      });

      // Center preview around given coordinates
      v.addOnceHandler("open", () => {
        const vp = v.viewport.imageToViewportCoordinates(x, y);
        v.viewport.panTo(vp, true);
        v.viewport.zoomTo(30, vp, true); // adjust zoom level for preview
      });

      previewViewer.current = v;
    }

    return () => {
      if (previewViewer.current) {
        previewViewer.current.destroy();
        previewViewer.current = null;
      }
    };
  }, [isPopupOpen, x, y, dziUrl]);

  return (
    <div
      className="p-0 m-0"
      onMouseOverCapture={() => setIsPopupOpen(true)}
      onMouseOutCapture={() => setIsPopupOpen(false)}
    >
      <div className="aspect-square w-4 bg-sky-500/60 rounded-full border-white border"></div>

      {isPopupOpen && (
        <div className="p-2 bg-white shadow-lg rounded-md w-56">
          <h1 className="text-base font-semibold">{label}</h1>
          <p className="text-sm">{description}</p>
          <p className="text-gray-500 text-xs mb-1">
            x: {Math.round(x)}, y: {Math.round(y)}
          </p>

          {/* Mini preview */}
          <div
            ref={previewRef}
            className="w-full h-32 border rounded-md overflow-hidden"
          />
        </div>
      )}
    </div>
  );
};



export default function OpenSeadragonViewer({ dziUrl }) {
  const ref = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [formPos, setFormPos] = useState(null);
  const [addCordData, setAddCordData] = useState({
    label: "",
    description: "",
  });

  useEffect(() => {
    if (!ref.current) return;

    const v = OpenSeadragon({
      element: ref.current,
      prefixUrl: "/openseadragon/images/",
      tileSources: dziUrl,
      showNavigator: true,
    });

    setViewer(v);

    const addOverlay = (x, y, label, description) => {
      const el = document.createElement("div");

      // Render React component into overlay div
      const root = ReactDOM.createRoot(el);
      root.render(<OverlayLabel label={label} description={description} x={x} y={y} dziUrl={dziUrl} />);

      v.addOverlay({
        element: el,
        location: v.viewport.imageToViewportCoordinates(x, y),
      });
    };

    const loadAnnotations = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_OPNSEA_URL);
        const data = await res.json();
        data.forEach((a) => addOverlay(a.geometry.x, a.geometry.y, a.label, a.description));
      } catch (err) {
        console.error(err);
      }
    };

    v.addOnceHandler("open", () => {
      loadAnnotations();
    });

    v.addHandler("canvas-click", (event) => {
      
        
      const webPoint = event.position;
      const viewportPoint = v.viewport.pointFromPixel(webPoint);
      const imagePoint = v.viewport.viewportToImageCoordinates(viewportPoint);
      setFormPos((fp)=>{
        if(!fp){
       
          return {
            x: webPoint.x,
            y: webPoint.y,
            imgX: imagePoint.x,
            imgY: imagePoint.y,
          };
        } else {
          return null
        }
      });
    });
        return () => v.destroy();
  }, [dziUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addCordData?.label || !addCordData?.description || !formPos) return;

    try {
      await fetch(import.meta.env.VITE_OPNSEA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: addCordData?.label,
          description: addCordData?.description,
          geometry: { x: formPos.imgX, y: formPos.imgY },
        }),
      });

      if (viewer) {
        // Add overlay using React component
        const el = document.createElement("div");
        const root = ReactDOM.createRoot(el);
        root.render(
          <OverlayLabel label={addCordData?.label} description={addCordData?.description} dziUrl={dziUrl}/>
        );

        viewer.addOverlay({
          element: el,
          location: viewer.viewport.imageToViewportCoordinates(
            formPos.imgX,
            formPos.imgY
          ),
        });
      }
    } catch (err) {
      console.error(err);
    }

    setAddCordData({ label: "", description: "" });
    setFormPos(null);
  };

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={ref} className="w-full h-full" />

      {/* Temporary pointer marker */}
      {formPos && (
        <div
          className="absolute w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-md"
          style={{
            top: formPos.y - 6,
            left: formPos.x - 6,
          }}
        />
      )}

      {/* Popup form */}
      {formPos && (
        <form
          onSubmit={handleSubmit}
          className="absolute flex-col flex items-center gap-2 bg-white p-3 rounded-xl shadow-lg border border-gray-200"
          style={{ top: formPos.y + 15, left: formPos.x + 15 }}
        >
          <input
            type="text"
            value={addCordData?.label}
            onChange={(e) =>
              setAddCordData({ ...addCordData, label: e.target.value })
            }
            placeholder="Enter label"
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            autoFocus
          />
          <input
            type="text"
            value={addCordData?.description}
            onChange={(e) =>
              setAddCordData({ ...addCordData, description: e.target.value })
            }
            placeholder="Enter description"
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 w-full hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm shadow-sm"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}
