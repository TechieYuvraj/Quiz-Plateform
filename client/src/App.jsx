import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

const RegisterForm = lazy(() => import('./components/user/RegisterForm.jsx'));
const ProfilePage = lazy(() => import('./components/user/ProfilePage.jsx'));
const LoginForm = lazy(() => import('./components/user/LoginForm.jsx'));
const Test = lazy(() => import('./components/user/Test.jsx'));
const QuizPage = lazy(() => import('./components/user/QuizPage.jsx'));
const QuizSummery = lazy(() => import('./components/user/QuizSummery.jsx'));

const AdminRegister = lazy(() => import('./components/ad/AdminRegister.jsx'));
const AdminLogin = lazy(() => import('./components/ad/AdminLogin.jsx'));
const AdminProfile = lazy(() => import('./components/ad/AdminProfile.jsx'));
const AdminDashboard = lazy(() => import('./components/ad/AdminDashboard.jsx'));
const CreateQuiz = lazy(() => import('./components/ad/CreateQuiz.jsx'));
const ManageQuestions = lazy(() => import('./components/ad/ManageQuestions.jsx'));
const ViewResults = lazy(() => import('./components/ad/ViewResults.jsx')); //ViewResults
const Home = lazy(() => import('./components/Home.jsx'));

import ProtectedRoute from './components/auth/ProtectedRoute.jsx'; //ProtectedAdminRoute
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute.jsx'; //ProtectedAdminRoute
// import Home from './components/Home.jsx';


function App() {
    useEffect(() => {
        let storedTheme = localStorage.getItem("theme");

        if (!storedTheme) {
            // Default to light
            localStorage.setItem("theme", "light");
            storedTheme = "light";
        }

        if (storedTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return (
        <Suspense>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
                <Route path="/:userId/:index" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                <Route path="/quiz/summary" element={<ProtectedRoute><QuizSummery /></ProtectedRoute>} />

                <Route path={`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/register`} element={<AdminRegister />} />
                <Route path={`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/login`} element={<AdminLogin />} />
                <Route path={`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/profile`} element={<AdminProfile />} />
                <Route path={`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/dashboard`} element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                <Route path={`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/create-quiz`} element={<ProtectedAdminRoute><CreateQuiz /></ProtectedAdminRoute>} />
                <Route path={`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/manage-questions`} element={<ProtectedAdminRoute><ManageQuestions /></ProtectedAdminRoute>} />
                <Route path={`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/results`} element={<ProtectedAdminRoute><ViewResults /></ProtectedAdminRoute>} />
            </Routes>
        </Suspense>
    );
}

export default App;
