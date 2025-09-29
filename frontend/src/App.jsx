import OpenSeadragonViewer from "./components/OpenSeadragonViewer";

export default function App(){
	return (
		<div className="App w-screen h-screen overflow-hidden flex p-0 m-0 flex-col">
			<div className="h-16 shadow-sm w-full"></div>
			<div className="grow fle bg-gray-500/70 p-0">
				<OpenSeadragonViewer dziUrl="/tiles/bigimage.dzi"/>

			</div>
		
		</div>
	);
}
