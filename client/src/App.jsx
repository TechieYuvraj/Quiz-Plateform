import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const RegisterForm = lazy(() => import('./components/user/RegisterForm.jsx'));
const ProfilePage = lazy(() => import('./components/user/ProfilePage.jsx'));
const LoginForm = lazy(() => import('./components/user/LoginForm.jsx'));
const Test = lazy(() => import('./components/user/Test.jsx'));
const QuizPage = lazy(() => import('./components/user/QuizPage.jsx'));
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';


function App() {
    return (
        <Suspense>
            <Routes>
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
                <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />


            </Routes>
        </Suspense>
    );
}

export default App;
