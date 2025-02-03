import FacebookIcon from '@mui/icons-material/Facebook';
import React from "react";
import { Link } from "react-router-dom";

const CustomerFooter = () => {
  return (
    <footer className="bg-neutral-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Về chúng tôi - Cột trái */}
          <div className="flex flex-col">
            <h3 className="text-[#9b51e0] font-semibold font-notoSansSC mb-4">VỀ CHÚNG TÔI</h3>
            <ul className="space-y-2 font-notoSansSC text-gray-300">
              <li><Link to="/about-us" className="hover:text-[#9b51e0] transition-colors duration-200">Giới thiệu</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#9b51e0] transition-colors duration-200">Bảo mật thông tin</Link></li>
              <li><Link to="/terms-and-policies" className="hover:text-[#9b51e0] transition-colors duration-200">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Thông tin liên hệ - Cột phải */}
          <div className="flex flex-col">
            <h3 className="text-[#9b51e0] font-semibold font-notoSansSC mb-4">THÔNG TIN LIÊN HỆ</h3>
            <ul className="space-y-2 font-notoSansSC text-gray-300">
              <li>Email: chillshaker05924@gmail.com</li>
              <li>Hotline: 0982502200</li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-8 pt-4 border-t border-neutral-700">
          <div className="text-center text-sm font-notoSansSC">
            <p className="text-[#9b51e0] font-medium mb-2">THƯỞNG THỨC CÓ TRÁCH NHIỆM</p>
            <p className="text-gray-300 mb-2">Dịch vụ không dành cho người dưới 18 tuổi và phụ nữ đang mang thai.</p>
            <p className="text-gray-300">Bản quyền © 2024 BAR BUDDY - Trao Niềm Tin Nhận Tài Lộc</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
