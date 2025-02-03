import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

const ProtectedAdminRoute = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUserRole = () => {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      if (!userInfo || !userInfo.accessToken) {
        setUserRole("GUEST");
        return;
      }

      try {
        const decodedToken = jwtDecode(userInfo.accessToken);
        const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setUserRole(role);
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        toast.error("Có lỗi xảy ra, vui lòng đăng nhập lại");
        setUserRole("GUEST");
      }
    };

    checkUserRole();
  }, []);

  if (userRole === null) {
    return <div>Đang tải...</div>;
  }

  if (userRole === "ADMIN") {
    return <Outlet />;
  } else if (userRole === "MANAGER" ) {
    return <Navigate to="/manager/managerDrinkCategory" replace />;
  } else if (userRole === "STAFF" ) {
    return <Navigate to="/staff/table-management" replace />;
  } else {
    toast.error("Bạn không có quyền truy cập trang này");
    return <Navigate to="/404" replace />;
  }
};

export default ProtectedAdminRoute;
