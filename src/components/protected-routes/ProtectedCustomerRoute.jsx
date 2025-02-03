import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedCustomerRoute = () => {
  const token = Cookies.get('token');
  const currentPath = window.location.pathname;

  // Danh sách các routes cần bảo vệ
  const protectedPaths = ['/booking-table'];
  
  // Kiểm tra xem route hiện tại có cần bảo vệ không
  const isProtectedPath = protectedPaths.includes(currentPath);

  // Nếu route cần bảo vệ và không có token -> chuyển đến 404
  if (isProtectedPath && !token) {
    return <Navigate to="/404" replace />;
  }

  // Nếu không phải route cần bảo vệ hoặc có token -> cho phép truy cập
  return <Outlet />;
};

export default ProtectedCustomerRoute;
