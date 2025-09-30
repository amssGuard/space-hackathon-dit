import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/pages/home";
import Preview from "./components/pages/preview";
// import Preview from "./components/pages/preview";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}

      <main className="p-0 m-0">
        <Routes>
          	<Route path="/" element={<Home />} />
		    <Route path="/preview/:fileId" element={<Preview />} />



        </Routes>
      </main>

    </div>
  );
}
