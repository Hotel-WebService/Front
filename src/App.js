import { Provider } from 'react-redux';
import { store } from './app/store';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FirstPage from './pages/FirstPage';
import AiPage from './pages/AiPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import SavedPage from './pages/SavedPage';
import ListPage from './pages/ListPage';
import ReservationPage from './pages/ReservationPage';
import SignupPage from './pages/SignupPage';
import HotelList from './pages/HotelList';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter> {/* ✅ Router로 감싸줌 */}
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/myPage" element={<MyPage />} />
          <Route path="/savedPage" element={<SavedPage />} />
          <Route path="/listPage" element={<ListPage />} />
          <Route path="/reservationPage" element={<ReservationPage />} />
          <Route path="/reservation/:id" element={<ReservationPage />} />
          <Route path="/signupPage" element={<SignupPage />} />
          <Route path="/hotelList" element={<HotelList />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;