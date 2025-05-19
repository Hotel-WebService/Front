import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import FirstPage from './pages/FirstPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import SavedPage from './pages/SavedPage';
import ListPage from './pages/ListPage';
import ReservationPage from './pages/ReservationPage';
import SignupPage from './pages/SignupPage';


function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/savedPage" element={<SavedPage />} />
        <Route path="/listPage" element={<ListPage />} />
        <Route path="/reservationPage" element={<ReservationPage />} />
        <Route path="/signupPage" element={<SignupPage />} />
      </Routes>
    </UserProvider>
  );
}

export default App;