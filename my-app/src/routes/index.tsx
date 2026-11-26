import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import LiveFeedPage from '../pages/LiveFeedPage'
import ContentPage from '../pages/ContentPage'
import DashboardPage from '../pages/DashboardPage'
export default function AppRoutes(){return <BrowserRouter><Routes><Route path="/sign-in" element={<SignInPage/>}/><Route path="/sign-up" element={<SignUpPage/>}/><Route element={<AppLayout/>}><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/live-feed" element={<LiveFeedPage/>}/><Route path="/content" element={<ContentPage/>}/></Route><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></BrowserRouter>}
