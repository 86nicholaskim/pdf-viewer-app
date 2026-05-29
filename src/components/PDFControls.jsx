export function PDFControls({ 
  pageNum, 
  totalPages, 
  onPrev, 
  onNext, 
  onPrint, 
  onPrintJPG, 
  onPrintBlob, 
  onGenerateHtmlJPG,
  onGenerateHtmlPNG
}) {
  return (
    <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button disabled={pageNum <= 1} onClick={onPrev}>
          이전 페이지
        </button>
        <span style={{ margin: "0 15px" }}>
          {pageNum} / {totalPages}
        </span>
        <button disabled={pageNum >= totalPages} onClick={onNext}>
          다음 페이지
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        <button 
          onClick={onPrint}
          style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}
        >
          PNG 스트링 인쇄
        </button>
        <button 
          onClick={onPrintJPG}
          style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "4px" }}
        >
          JPG 스트링 인쇄 (저용량)
        </button>
        <button 
          onClick={onPrintBlob}
          style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "#6f42c1", color: "white", border: "none", borderRadius: "4px" }}
        >
          Blob 객체 인쇄 (메모리 효율)
        </button>
        <button 
          onClick={onGenerateHtmlJPG}
          style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px" }}
        >
          외부용 HTML (JPG)
        </button>
        <button 
          onClick={onGenerateHtmlPNG}
          style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "#0056b3", color: "white", border: "none", borderRadius: "4px" }}
        >
          외부용 HTML (PNG)
        </button>
      </div>
    </div>
  );
}
