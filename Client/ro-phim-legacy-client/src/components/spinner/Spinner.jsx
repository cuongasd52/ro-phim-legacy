const Spinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '70vh' }}>
      <div className="text-center">
        <div
          className="spinner-border text-info" // Màu xanh info đồng bộ với dự án
          role="status"
          style={{ width: '4rem', height: '4rem', borderWidth: '0.4rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-3 text-light fw-light">Preparing your cinema experience...</h5>
      </div>
    </div>
  );
}

export default Spinner;