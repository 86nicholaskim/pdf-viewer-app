interface FileUploaderProps {
  onFileChange: (file: File) => void;
}

export function FileUploader({ onFileChange }: FileUploaderProps) {
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
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
          }
        }}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}
