export function PDFControls({ pageNum, totalPages, onPrev, onNext, onPrint, onGenerateHtml }) {
  return (
    <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
      <button disabled={pageNum <= 1} onClick={onPrev}>
        이전 페이지
      </button>
      <span style={{ margin: "0 15px" }}>
        {pageNum} / {totalPages}
      </span>
      <button disabled={pageNum >= totalPages} onClick={onNext}>
        다음 페이지
      </button>
      <div style={{ borderLeft: "1px solid #ccc", height: "20px", margin: "0 10px" }}></div>
      <button 
        onClick={onPrint}
        style={{ padding: "5px 15px", cursor: "pointer", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}
      >
        이미지 인쇄 (전체)
      </button>
      <button 
        onClick={onGenerateHtml}
        style={{ padding: "5px 15px", cursor: "pointer", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px" }}
      >
        외부문서용 HTML 생성
      </button>
    </div>
  );
}
