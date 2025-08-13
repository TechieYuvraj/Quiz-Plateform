import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

const RegisterForm = lazy(() => import('./components/user/RegisterForm.jsx'));
const ProfilePage = lazy(() => import('./components/user/ProfilePage.jsx'));
const LoginForm = lazy(() => import('./components/user/LoginForm.jsx'));
const Test = lazy(() => import('./components/user/Test.jsx'));
const QuizPage = lazy(() => import('./components/user/QuizPage.jsx'));
const QuizSummery = lazy(() => import('./components/user/QuizSummery.jsx'));
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';


function App() {
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (
            storedTheme === "dark" ||
            (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);
    return (
        <Suspense>
            <Routes>
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
                <Route path="/:userId/:index" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                <Route path="/quiz/summary" element={<ProtectedRoute><QuizSummery /></ProtectedRoute>} />


            </Routes>
        </Suspense>
    );
}

export default App;
