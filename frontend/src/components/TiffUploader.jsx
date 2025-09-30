import { useState } from "react";

export default function TiffUploader() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/convert-tiff", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white w-fit flex flex-col gap-3">
      <input
        type="file"
        accept=".tif,.tiff"
        onChange={(e) => setFile(e.target.files[0])}
        className="border px-2 py-1 rounded-md"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Upload TIFF"}
      </button>

      {result && (
        <div className="mt-3 text-sm">
          <p className="font-semibold">Server Response:</p>
          <pre className="bg-gray-100 p-2 rounded-md text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
