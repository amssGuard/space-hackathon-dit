import OpenSeadragonViewer from "./components/OpenSeadragonViewer";

export default function App(){
	return (
		<div className="App">
		<h1 className="text-xl font-bold p-4">NASA Image Explorer</h1>
		<OpenSeadragonViewer dziUrl="/tiles/bigimage.dzi"/>
		</div>
	);
}
