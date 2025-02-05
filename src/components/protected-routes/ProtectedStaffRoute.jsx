import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import useAuthStore from 'src/libs/hooks/useUserStore';

const ProtectedStaffRoute = () => {
  const [userScope, setUserScope] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const checkUserScope = () => {
      if (!token) {
        setUserScope("GUEST");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const scope = decodedToken.scope; // Lấy scope từ JWT
        setUserScope(scope);
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        toast.error("Có lỗi xảy ra, vui lòng đăng nhập lại");
        setUserScope("GUEST");
      }
    };

    checkUserScope();
  }, [token]);

  if (userScope === null) {
    return <div>Đang tải...</div>;
  }

  if (userScope === "STAFF") {
    return <Outlet />;
  } else if (userScope === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (userScope === "MANAGER") {
    return <Navigate to="/manager/managerDrinkCategory" replace />;
  } else {
    toast.error("Bạn không có quyền truy cập trang này");
    return <Navigate to="/404" replace />;
  }
};

export default ProtectedStaffRoute;
