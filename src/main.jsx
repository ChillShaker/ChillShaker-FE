import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import HomePage from './pages/home-page/HomePage'
import BarDetail from './pages/bar-detail/BarDetail'
import BookingTable from './pages/booking-page/components/BookingTable'
import CustomerLayout from './components/customer-components/CustomerLayout'
import DrinkList from './pages/drink-page/DrinkList'
import ProtectedCustomerRoute from './components/protected-routes/ProtectedCustomerRoute'
import Page404 from './pages/(error)/Page404'
import PaymentSuccess from './pages/payment-status/components/PaymentSuccess'
import PaymentError from './pages/payment-status/components/PaymentError'
import MyProfilePage from './pages/my-profile-page/MyProfilePage'
import BookingInfoPage from './pages/booking-info-page/BookingInfoPage'
import BookingDrink from './pages/booking-page/components/BookingDrink'
import BookingPayment from './pages/booking-page/components/BookingPayment'
import BookingMenu from './pages/booking-page/components/BookingMenu'
import BookingManagementPage from './pages/staff-pages/booking-management-page/BookingManagementPage'
import ProtectedStaffRoute from './components/protected-routes/ProtectedStaffRoute'
import StaffLayout from './components/staff-components/StaffLayout'
import BookingInfoPageForStaff from './pages/staff-pages/booking-info-page/BookingInfoPageForStaff'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedCustomerRoute />}>
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="bar-detail" element={<BarDetail />} />
            <Route path="booking/tables" element={<BookingTable />} />
            <Route path="booking/drinks" element={<BookingDrink />} />
            <Route path="booking/payment" element={<BookingPayment />} />
            <Route path="booking/menus" element={<BookingMenu />} />
            <Route path="drinks" element={<DrinkList />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-error" element={<PaymentError />} />
            <Route path="my-profile" element={<MyProfilePage />} />
            <Route path="booking-info/:id" element={<BookingInfoPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedStaffRoute />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route path="booking-management" element={<BookingManagementPage />} />
            <Route path="booking-info/:id" element={<BookingInfoPageForStaff />} />
          </Route>
        </Route>

        <Route path="/404" element={<Page404 />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
