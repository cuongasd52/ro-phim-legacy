# RoPhimLegacy - Movie Discovery & Recommendation System

**RoPhimLegacy** là một ứng dụng quản lý và đề xuất phim hiện đại, được xây dựng với kiến trúc Fullstack mạnh mẽ. Dự án tập trung vào trải nghiệm người dùng mượt mà và khả năng phân tích phim thông qua AI.

## 🚀 Công nghệ sử dụng

### Backend (Server)

- **Java 21** & **Spring Boot 3.2.2**
- **Spring Security** & **JWT** (Stateless/Stateful Hybrid Authentication)
- **Spring Data MongoDB**: Quản lý cơ sở dữ liệu NoSQL
- **Google Gemini API**: Hỗ trợ tính năng AI Service
- **Maven**: Quản lý thư viện và vòng đời dự án

### Frontend (Client)

- **React** (Vite)
- **Axios**: Xử lý request API với Interceptors
- **CSS Modern**: Giao diện Dark Mode tối ưu trải nghiệm

### Testing & Tools

- **Cypress**: Kiểm thử E2E
- **JUnit 5 & Mockito**: Unit Test cho Service layer
- **MongoDB Compass**: Quản lý dữ liệu trực quan

## ✨ Tính năng chính

- **Khám phá phim**: Danh sách phim phong phú với hình ảnh chất lượng cao từ TMDB.
- **Đề xuất thông minh**: Hệ thống gợi ý phim dựa trên sở thích người dùng.
- **Hệ thống đánh giá**: Người dùng có thể xếp hạng phim (Excellent, Okay, Bad, Terrible) và viết review.
- **Quản trị viên (Admin)**: Quyền chỉnh sửa và xóa phim trực tiếp trên giao diện.
- **Bảo mật cao**: Hệ thống Authentication đa lớp chống lại các cuộc tấn công XSS và CSRF.

## 🛠 Cài đặt

1. **Yêu cầu hệ thống**: Cài đặt sẵn Java 21, Node.js và MongoDB Local.
2. **Cấu hình biến môi trường**: Sao chép `.env.example` thành `.env` và điền các thông tin:
   - `MONGODB_URI`
   - `GOOGLE_API_KEY`
   - `SECRET_KEY` (Cho JWT)
3. **Chạy Backend**:
   ```bash
   cd Server/MagicStreamMoviesJavaBackend
   mvn spring-boot:run
   ```
