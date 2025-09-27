import { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";

export default function OpenSeadragonViewer({ dziUrl }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const viewer = OpenSeadragon({
      element: ref.current,
      prefixUrl: "/openseadragon/images/", // icons folder
      tileSources: dziUrl,                 // your DZI file
      showNavigator: true,
      defaultZoomLevel: 1,
      minZoomLevel: 0.5,
      maxZoomPixelRatio: 2,
      visibilityRatio: 1.0,
      constrainDuringPan: true,
    });

    return () => viewer.destroy();
  }, [dziUrl]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "90vh", background: "black" }}
    />
  );
}
