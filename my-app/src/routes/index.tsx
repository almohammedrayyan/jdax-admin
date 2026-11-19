import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import SignInPage from '../pages/SignInPage'
import LiveFeedPage from '../pages/LiveFeedPage'
import ContentPage from '../pages/ContentPage'
export default function AppRoutes(){return <BrowserRouter><Routes><Route path="/sign-in" element={<SignInPage/>}/><Route path="/" element={<Navigate to="/sign-in" replace/>}/><Route element={<AppLayout/>}><Route path="/live-feed" element={<LiveFeedPage/>}/><Route path="/content" element={<ContentPage/>}/></Route><Route path="*" element={<Navigate to="/sign-in" replace/>}/></Routes></BrowserRouter>}
