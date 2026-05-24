export function PDFControls({ pageNum, totalPages, onPrev, onNext }) {
  return (
    <div style={{ marginBottom: "15px" }}>
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
  );
}
