
import OpenSeadragonViewer from "../OpenSeadragonViewer";
import { useParams } from "react-router-dom";

export default function Preview(){
      const { fileId } = useParams(); // <-- dynamic variable from URL
    // const fileId = "bigimage"
    return (
        <div className="App w-screen h-screen overflow-hidden flex p-0 m-0 flex-col">
            <div className="h-24 shadow-sm w-full">
                
            </div>
            <div className="grow fle bg-gray-500/70 p-0">
            <OpenSeadragonViewer dziUrl={`/uploads/tiles/${fileId}/${fileId}.dzi`} />
            </div>
            </div>
    );
}
