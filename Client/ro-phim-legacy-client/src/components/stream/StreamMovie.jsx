import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Container } from 'react-bootstrap';
import './StreamMovie.css';

const StreamMovie = () => {
  // Lấy yt_id từ URL (Ví dụ: /stream/dQw4w9WgXcQ)
  const { yt_id } = useParams();

  return (
    <div className="stream-wrapper bg-black">
      <Container fluid className="p-0">
        <div className="react-player-container">
          {yt_id ? (
            <ReactPlayer
              controls={true} // Boolean prop chuẩn React
              playing={true}
              url={`https://www.youtube.com/watch?v=${yt_id}`}
              width="100%"
              height="100%"
              config={{
                youtube: {
                  playerVars: { showinfo: 1 }
                }
              }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center text-white h-100">
              <h4>Video not found</h4>
            </div>
          )}
        </div>
      </Container>

      {/* Thêm phần tiêu đề hoặc mô tả dưới video nếu muốn */}
      <div className="container mt-4 text-light">
        <h2 className="border-bottom pb-2">Now Streaming</h2>
        <p className="text-muted small">
          Enjoy your movie. If the video doesn't play, please check your internet connection.
        </p>
      </div>
    </div>
  );
}

export default StreamMovie;