import React from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/bar-detail');
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Video Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/df7cxhb9s/video/upload/v1736053794/caetfwzlkayhknsgfrnr.mp4"
            type="video/mp4"
          />
        </video>
        {/* Overlay tối để text dễ đọc hơn */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-notoSansSC">
            Chào mừng đến với{" "}
            <span className="text-[#9b51e0]">CHILL SHAKER</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl font-notoSansSC">
            Khám phá thế giới cocktail tuyệt vời và trải nghiệm đặt bàn dễ dàng tại các quán bar hàng đầu
          </p>

          <div className="space-x-4">
            <button
              onClick={handleExploreClick}
              className="gradient-button inline-block px-8 py-3 text-white font-semibold rounded-full shadow-lg font-notoSansSC"
            >
              Khám phá ngay
            </button>
            <Link
              to="/about-us"
              className="inline-block px-8 py-3 bg-transparent border-2 border-[#9b51e0] text-white font-semibold rounded-full hover:bg-[#9b51e0] hover:border-transparent transition duration-300 font-notoSansSC"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full">
          <div className="bg-black bg-opacity-70 p-6 rounded-xl text-center border border-[#9b51e0]/30">
            <h3 className="text-[#9b51e0] text-xl font-bold mb-4 font-notoSansSC">Đặt Bàn Dễ Dàng</h3>
            <p className="text-gray-300 font-notoSansSC">
              Đặt bàn nhanh chóng và thuận tiện tại các quán bar yêu thích của bạn
            </p>
          </div>

          <div className="bg-black bg-opacity-70 p-6 rounded-xl text-center border border-[#9b51e0]/30">
            <h3 className="text-[#9b51e0] text-xl font-bold mb-4 font-notoSansSC">Khám Phá Menu</h3>
            <p className="text-gray-300 font-notoSansSC">
              Tìm hiểu về các loại cocktail độc đáo và menu đặc biệt
            </p>
          </div>

          <div className="bg-black bg-opacity-70 p-6 rounded-xl text-center border border-[#9b51e0]/30">
            <h3 className="text-[#9b51e0] text-xl font-bold mb-4 font-notoSansSC">Ưu Đãi Hấp Dẫn</h3>
            <p className="text-gray-300 font-notoSansSC">
              Nhận các ưu đãi đặc biệt và khuyến mãi hấp dẫn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
