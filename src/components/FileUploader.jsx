export function FileUploader({ onFileChange }) {
  return (
    <div
      style={{
        margin: "20px 0",
        padding: "15px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        display: "inline-block",
      }}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => onFileChange(e.target.files[0])}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}
