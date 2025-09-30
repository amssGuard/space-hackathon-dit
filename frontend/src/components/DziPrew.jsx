import { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";

export default function DziPreview({ fileId   }) {
  const dziUrl = `/uploads/tiles/${fileId}/${fileId}.dzi`;
  const previewRef = useRef(null);
  const previewViewer = useRef(null);

  useEffect(() => {
    // Only initialize when popup opens and ref exists
      console.log("Initializing preview viewer for", dziUrl);
      const viewer = OpenSeadragon({
        element: previewRef.current,
        prefixUrl: "/openseadragon/images/",
        tileSources: dziUrl,
        showNavigator: false,
        showNavigationControl: false,
        gestureSettingsMouse: {
          scrollToZoom: false,
          clickToZoom: false,
          dblClickToZoom: false,
        },
      });

      // Once image is loaded, center and zoom around given coordinates
      // viewer.addOnceHandler("open", () => {
      //   // adjust zoom for preview
      // });

      previewViewer.current = viewer;
    
    // Cleanup when popup closes or component unmounts
    return () => {
      if (previewViewer.current) {
        previewViewer.current.destroy();
        previewViewer.current = null;
      }
    };
  }, [ dziUrl]);

  return (
    <div
      onClick={(e) =>{
        window.location.href = `/preview/${fileId}`
      }}
      ref={previewRef}
      className="w-48 h-48 border rounded-md overflow-hidden"
    />
  );
}
