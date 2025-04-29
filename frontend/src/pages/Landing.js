import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaHeart, FaComments, FaMugHot, FaUserFriends, FaMapMarkerAlt, FaRegSmile } from 'react-icons/fa';
import logo from '../images/logo2.png';

const Landing = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const featureVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const stepVariant = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-yellow-100 to-white "></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="w-full relative z-10">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.img 
              src={logo} 
              alt="BOBACE" 
              className="h-40 md:h-56 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              BOBACE
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-neutral-700 mb-4 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Kết nối những người yêu thích trà sữa, tìm kiếm bạn bè hoặc nửa kia có cùng sở thích
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link 
                to="/register" 
                className="bg-yellow-500 text-white px-8 py-6 rounded-full hover:bg-yellow-600 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Đăng ký ngay
              </Link>
              <Link 
                to="/login" 
                className="bg-white text-yellow-600 border-2 border-yellow-500 px-8 py-6 rounded-full hover:bg-yellow-50 text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Đăng nhập
              </Link>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-white/90 to-yellow-50/90 backdrop-blur-md p-7 rounded-2xl shadow-lg mb-10 max-w-2xl mx-auto border border-yellow-100 mt-10"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.1), 0 8px 10px -6px rgba(245, 158, 11, 0.1)" }}
            >
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-xl font-bold text-yellow-600 mb-2 relative">
                  <span className="relative z-10">Ý Nghĩa Tên BOBACE</span>
                  <span className="absolute bottom-1 left-0 w-full h-2 bg-yellow-200 opacity-50 z-0"></span>
                </h3>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <span className="font-semibold text-xl text-yellow-700 bg-yellow-100 px-3 py-1 rounded-lg">BOBA</span>
                  <span className="text-2xl text-yellow-500">+</span>
                  <span className="font-semibold text-xl text-yellow-700 bg-yellow-100 px-3 py-1 rounded-lg">ACE</span>
                  <span className="text-2xl text-yellow-500">=</span>
                  <span className="font-bold text-xl text-yellow-700 bg-yellow-200 px-3 py-1 rounded-lg shadow-sm">BOBACE</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-yellow-100 transform transition-transform duration-300 hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold mr-2 shadow-sm">B</div>
                    <h4 className="font-semibold text-yellow-700">Boba</h4>
                  </div>
                  <p className="text-neutral-600 text-sm">
                    Trà sữa - biểu tượng của niềm vui, sự trẻ trung và ngọt ngào trong cuộc sống
                  </p>
                </div>
                
                <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-yellow-100 transform transition-transform duration-300 hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-2 shadow-sm">A</div>
                    <h4 className="font-semibold text-yellow-700">Ace</h4>
                  </div>
                  <p className="text-neutral-600 text-sm">
                    "Tuyệt đỉnh", "hạng nhất" - đại diện cho trải nghiệm kết nối chất lượng cao
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50/80 p-4 rounded-xl border border-yellow-200 relative">
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-neutral-700 text-center font-medium">
                  BOBACE mang đến thông điệp về <span className="text-yellow-600">"trà sữa hạng nhất"</span> và <span className="text-yellow-600">"trải nghiệm hẹn hò đỉnh cao"</span> - nơi những người yêu thích trà sữa tìm thấy kết nối đặc biệt của mình.
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                <p className="text-3xl font-bold text-yellow-500">500+</p>
                <p className="text-neutral-600">Người dùng thử nghiệm</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                <p className="text-3xl font-bold text-yellow-500">62+</p>
                <p className="text-neutral-600">Match thành công</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                <p className="text-3xl font-bold text-yellow-500">30+</p>
                <p className="text-neutral-600">Loại trà sữa</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                <p className="text-3xl font-bold text-yellow-500">85%</p>
                <p className="text-neutral-600">Đánh giá tích cực</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              Tính năng
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Khám phá những tính năng độc đáo giúp bạn tìm kiếm và kết nối với những người có cùng sở thích về trà sữa
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 card-hover"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaMugHot />
              </div>
              <h3 className="text-xl font-bold mb-3">Kết nối qua trà sữa</h3>
              <p className="text-neutral-600">
                Tìm kiếm người có cùng sở thích về trà sữa, từ hương vị yêu thích đến quán quen thuộc. Chia sẻ niềm đam mê với trà sữa cùng nhau.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 card-hover"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaHeart />
              </div>
              <h3 className="text-xl font-bold mb-3">Tìm kiếm và Match</h3>
              <p className="text-neutral-600">
                Khám phá hồ sơ của những người dùng khác, thích và được thích để tạo match. Thuật toán thông minh giúp bạn tìm được người phù hợp nhất.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 card-hover"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaComments />
              </div>
              <h3 className="text-xl font-bold mb-3">Trò chuyện thời gian thực</h3>
              <p className="text-neutral-600">
                Kết nối và trò chuyện với những người bạn đã match, lên kế hoạch hẹn hò trà sữa. Chia sẻ hình ảnh và cảm xúc ngay lập tức.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 card-hover"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaUserFriends />
              </div>
              <h3 className="text-xl font-bold mb-3">Cộng đồng trà sữa</h3>
              <p className="text-neutral-600">
                Tham gia vào cộng đồng những người yêu thích trà sữa, chia sẻ kinh nghiệm và khám phá những quán trà sữa mới.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 card-hover"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaMapMarkerAlt />
              </div>
              <h3 className="text-xl font-bold mb-3">Tìm kiếm theo vị trí</h3>
              <p className="text-neutral-600">
                Tìm kiếm người dùng gần bạn, khám phá những quán trà sữa phổ biến trong khu vực và lên kế hoạch hẹn hò dễ dàng.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 card-hover"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaRegSmile />
              </div>
              <h3 className="text-xl font-bold mb-3">Hồ sơ chi tiết</h3>
              <p className="text-neutral-600">
                Tạo hồ sơ chi tiết với thông tin về sở thích trà sữa, lối sống và mong muốn, giúp tìm kiếm người phù hợp nhất với bạn.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              Hướng dẫn
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Chỉ với vài bước đơn giản, bạn có thể bắt đầu hành trình tìm kiếm bạn trà sữa của mình
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div 
              className="flex flex-col md:flex-row items-start mb-12 relative"
              variants={stepVariant}
            >
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
                <div className="bg-yellow-500 text-white rounded-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-3">Tạo hồ sơ cá nhân</h3>
                <p className="text-neutral-600 text-lg mb-4">
                  Đăng ký tài khoản, tạo hồ sơ với thông tin cá nhân và sở thích về trà sữa. Càng chi tiết càng tốt để tìm được người phù hợp.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <ul className="text-neutral-600">
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Thêm ảnh đại diện hấp dẫn
                    </li>
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Chia sẻ sở thích về trà sữa
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Viết giới thiệu về bản thân
                    </li>
                  </ul>
                </div>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute left-[calc(16.67%-8px)] top-16 bottom-0 w-1 bg-yellow-200"></div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col md:flex-row items-start mb-12 relative"
              variants={stepVariant}
            >
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
                <div className="bg-yellow-500 text-white rounded-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-3">Khám phá và tương tác</h3>
                <p className="text-neutral-600 text-lg mb-4">
                  Xem hồ sơ của những người dùng khác, thích hoặc bỏ qua dựa trên sở thích của bạn. Thuật toán sẽ học từ lựa chọn của bạn.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <ul className="text-neutral-600">
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Vuốt phải để thích, trái để bỏ qua
                    </li>
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Xem thông tin chi tiết về sở thích trà sữa
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Tìm kiếm theo vị trí và sở thích
                    </li>
                  </ul>
                </div>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute left-[calc(16.67%-8px)] top-16 bottom-0 w-1 bg-yellow-200"></div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col md:flex-row items-start mb-12 relative"
              variants={stepVariant}
            >
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
                <div className="bg-yellow-500 text-white rounded-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-3">Match và trò chuyện</h3>
                <p className="text-neutral-600 text-lg mb-4">
                  Khi hai người cùng thích nhau, một match được tạo ra và bạn có thể bắt đầu trò chuyện. Đây là cơ hội để tìm hiểu thêm.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <ul className="text-neutral-600">
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Nhận thông báo khi có match mới
                    </li>
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Trò chuyện thời gian thực
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Chia sẻ hình ảnh và trải nghiệm
                    </li>
                  </ul>
                </div>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute left-[calc(16.67%-8px)] top-16 bottom-0 w-1 bg-yellow-200"></div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col md:flex-row items-start"
              variants={stepVariant}
            >
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
                <div className="bg-yellow-500 text-white rounded-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">
                  4
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-3">BOBACE</h3>
                <p className="text-neutral-600 text-lg mb-4">
                  Lên kế hoạch gặp gỡ và thưởng thức trà sữa cùng nhau tại những quán yêu thích. Bắt đầu mối quan hệ mới với niềm đam mê chung.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <ul className="text-neutral-600">
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Gợi ý quán trà sữa phù hợp
                    </li>
                    <li className="mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Chia sẻ vị trí và hướng dẫn đường đi
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Đánh giá trải nghiệm sau khi gặp gỡ
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              Đánh giá
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Người dùng nói gì về chúng tôi
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Hàng ngàn người đã tìm thấy bạn trà sữa của mình thông qua ứng dụng của chúng tôi
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100"
              variants={featureVariant}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-bold">Minh Anh</h4>
                  <p className="text-neutral-500 text-sm">Hà Nội</p>
                </div>
              </div>
              <p className="text-neutral-600 mb-4">
                "Tôi đã tìm thấy người bạn tâm giao qua ứng dụng này. Chúng tôi có cùng sở thích về trà sữa và giờ đây chúng tôi thường xuyên đi uống trà sữa cùng nhau vào cuối tuần."
              </p>
              <div className="flex text-yellow-500">
                <FaHeart />
                <FaHeart />
                <FaHeart />
                <FaHeart />
                <FaHeart />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100"
              variants={featureVariant}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-4">
                  T
                </div>
                <div>
                  <h4 className="font-bold">Thanh Tùng</h4>
                  <p className="text-neutral-500 text-sm">TP. Hồ Chí Minh</p>
                </div>
              </div>
              <p className="text-neutral-600 mb-4">
                "Ứng dụng tuyệt vời để tìm kiếm những người có cùng sở thích. Tôi đã match với một cô gái có cùng sở thích về trà sữa và chúng tôi đã hẹn hò được 3 tháng rồi."
              </p>
              <div className="flex text-yellow-500">
                <FaHeart />
                <FaHeart />
                <FaHeart />
                <FaHeart />
                <FaHeart />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100"
              variants={featureVariant}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-4">
                  H
                </div>
                <div>
                  <h4 className="font-bold">Hương Giang</h4>
                  <p className="text-neutral-500 text-sm">Đà Nẵng</p>
                </div>
              </div>
              <p className="text-neutral-600 mb-4">
                "Tôi thích cách ứng dụng kết nối những người có cùng sở thích về trà sữa. Giao diện dễ sử dụng và tôi đã tìm thấy nhiều bạn mới có cùng đam mê."
              </p>
              <div className="flex text-yellow-500">
                <FaHeart />
                <FaHeart />
                <FaHeart />
                <FaHeart />
                <FaHeart />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full opacity-20"></div>
          <div className="absolute top-40 -left-20 w-80 h-80 bg-yellow-400 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 right-20 w-60 h-60 bg-yellow-300 rounded-full opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Sẵn sàng tìm kiếm bạn trà sữa?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-yellow-100">
              Đăng ký ngay hôm nay và bắt đầu kết nối với những người có cùng sở thích về trà sữa
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/register" 
                className="bg-white text-yellow-600 px-8 py-6 rounded-full hover:bg-yellow-50 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
              >
                Tham gia ngay
              </Link>
            </motion.div>
            
            <p className="mt-6 text-yellow-100">
              Đã có tài khoản? <Link to="/login" className="text-white font-medium underline">Đăng nhập</Link>
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={logo} alt="BOBACE" className="h-16 mb-4" />
              <p className="text-neutral-400">
                Kết nối những người yêu thích trà sữa, tìm kiếm bạn bè hoặc nửa kia có cùng sở thích
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Liên kết</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-neutral-400 hover:text-white transition-colors">Trang chủ</Link></li>
                <li><Link to="/about" className="text-neutral-400 hover:text-white transition-colors">Giới thiệu</Link></li>
                <li><Link to="/features" className="text-neutral-400 hover:text-white transition-colors">Tính năng</Link></li>
                <li><Link to="/contact" className="text-neutral-400 hover:text-white transition-colors">Liên hệ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Pháp lý</h4>
              <ul className="space-y-2">
                <li><Link to="/terms-of-service" className="text-neutral-400 hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
                <li><Link to="/privacy-policy" className="text-neutral-400 hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="/cookie-policy" className="text-neutral-400 hover:text-white transition-colors">Chính sách cookie</Link></li>
                <li><Link to="/legal" className="text-neutral-400 hover:text-white transition-colors">Pháp lý</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Theo dõi chúng tôi</h4>
              <div className="flex space-x-4">
                <button className="text-neutral-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <button className="text-neutral-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <button className="text-neutral-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-400">
            <p>&copy; {new Date().getFullYear()} BOBACE. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;