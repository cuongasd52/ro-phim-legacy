import { Routes, Route, useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import axiosClient from './api/axiosConfig';

// Components
import Header from './components/header/Header';
import Layout from './components/Layout';
import RequiredAuth from './components/RequiredAuth';
import Home from './components/home/Home';
import Recommended from './components/recommended/Recommended';
import Review from './components/review/Review';
import Register from './components/register/Register';
import Login from './components/login/Login';
import StreamMovie from './components/stream/StreamMovie';
import AddMovie from './components/addmovie/AddMovie';
import EditMovie from './components/editmovie/EditMovie';
import './App.css';

function App() {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const updateMovieReview = (imdb_id) => {
    navigate(`/review/${imdb_id}`);
  };

  const handleLogout = async () => {
    try {
      if (auth?.user_id) {
        await axiosClient.post("/logout", { user_id: auth.user_id });
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setAuth(null);
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Layout handleLogout={handleLogout} />}>


        <Route path="/" element={<Home updateMovieReview={updateMovieReview} />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />


        <Route element={<RequiredAuth allowedRoles={['USER', 'ADMIN']} />}>
          <Route path="recommended" element={<Recommended />} />
          <Route path="stream/:yt_id" element={<StreamMovie />} />
        </Route>


        <Route element={<RequiredAuth allowedRoles={['ADMIN']} />}>
          <Route path="review/:imdb_id" element={<Review />} />
          <Route path="admin/add-movie" element={<AddMovie />} />
          <Route path="admin/edit-movie/:imdb_id" element={<EditMovie />} />
        </Route>

      </Route>
    </Routes>
  );
}

export default App;