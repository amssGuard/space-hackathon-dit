import { useEffect, useState } from "react";
import TiffUploader from "../TiffUploader";
import DziPreview from "../DziPrew";
import { Link } from "react-router-dom";

export default function Home(){
	const [tiffs, setTiffs] = useState([]);
	useEffect(() => {
		fetch( import.meta.env.VITE_BACKEND_URL + "/tiffs")
			.then((res) => res.json())
			.then((data) => setTiffs(data))
			.catch((err) => console.error("Error fetching TIFFs:", err));
	}, []);
	return (
		<div className="App w-screen h-screen overflow-hidden flex p-0 m-0 flex-col">
			{/* <div className="h-24 shadow-sm w-full">
				
			</div> */}
			<div className="grow fle h-full overflow-y-auto bg-gray-500/70 p-0">
			<div className="grid  grid-cols-1 gap-4 p-4">
					{tiffs.map((tiff) => (
						<Link key={tiff.id} className="bg-white p-2  rounded-lg shadow-md" to={`/preview/${tiff.file_id}`}>
							<h2 className="font-semibold mb-2">{tiff.name}</h2>
							<DziPreview fileId={tiff.file_id} />
							{/* <OpenSeadragonViewer dziUrl={`/tiles/${tiff.file_id}.dzi`} /> */}
						</Link>
					))}
				</div>
				{/* <OpenSeadragonViewer dziUrl="/tiles/bigimage.dzi"/> */}
				{tiffs.length === 0 && (
					<p className="text-white text-center mt-10">No TIFFs uploaded yet.</p>
				)}
				<TiffUploader />
			</div>
		
		</div>
	);
}
