import { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";

export default function OpenSeadragonViewer({ dziUrl }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const v = OpenSeadragon({
      element: ref.current,
      prefixUrl: "/openseadragon/images/",
      tileSources: dziUrl,
      showNavigator: true,
    });

    const addOverlay = (x, y, label) => {
      const el = document.createElement("div");
      el.className = "overlay-label";
      el.innerText = label;
      v.addOverlay({
        element: el,
        location: v.viewport.imageToViewportCoordinates(x, y)
      });
    };

    const loadAnnotations = async () => {
      try {
        const res = await fetch("http://localhost:8000/annotations");
        const data = await res.json();
        data.forEach(a => addOverlay(a.geometry.x, a.geometry.y, a.label));
      } catch (err) {
        console.error(err);
      }
    };

    v.addOnceHandler("open", () => {
      loadAnnotations(); // load saved overlays after image loads
    });

    v.addHandler("canvas-click", async (event) => {
      const webPoint = event.position;
      const viewportPoint = v.viewport.pointFromPixel(webPoint);
      const imagePoint = v.viewport.viewportToImageCoordinates(viewportPoint);

      const label = prompt("Enter label for this point:");
      if (!label) return;

      try {
        await fetch("http://localhost:8000/annotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, geometry: { x: imagePoint.x, y: imagePoint.y } })
        });
      } catch (err) {
        console.error(err);
      }

      addOverlay(imagePoint.x, imagePoint.y, label);
    });

    return () => v.destroy();
  }, [dziUrl]);

  return <div ref={ref} style={{ width: "100%", height: "90vh", background: "black", position: "relative" }} />;
}
