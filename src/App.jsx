// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import { AppLayout } from './components/AppLayout';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import { AuthLayout } from './components/AuthLayout';
import ClearCookie from './pages/ClearCookie';
import Settings from './pages/Settings';


const App = () => {
    return (
        <Routes>
            <Route path="/clear" element={<ClearCookie />} />
            <Route element={<AuthLayout />}>
                <Route path="/" element={<Login />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Route>
            <Route element={<AppLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
        </Routes>
    );
};

export default App;
