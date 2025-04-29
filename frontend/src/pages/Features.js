import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, FaHeart, FaComments, FaMugHot, FaUserFriends, 
  FaMapMarkerAlt, FaRegSmile, FaUserSecret, FaShieldAlt, 
  FaBell, FaMobileAlt, FaLock, FaFilter, FaUserCheck
} from 'react-icons/fa';
import Footer from '../components/Footer';

const Features = () => {
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

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      {/* Header Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              Khám phá
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              Tính năng nổi bật
            </h1>
            <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
              BOBACE cung cấp nhiều tính năng độc đáo giúp bạn kết nối với những người có cùng sở thích về trà sữa
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Tính năng chính
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Những tính năng cốt lõi giúp bạn tìm kiếm và kết nối với những người có cùng sở thích
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaMugHot />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Kết nối qua trà sữa</h3>
              <p className="text-neutral-600">
                Tìm kiếm người có cùng sở thích về trà sữa, từ hương vị yêu thích đến quán quen thuộc. Chia sẻ niềm đam mê với trà sữa cùng nhau.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaHeart />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Tìm kiếm và Match</h3>
              <p className="text-neutral-600">
                Khám phá hồ sơ của những người dùng khác, thích và được thích để tạo match. Thuật toán thông minh giúp bạn tìm được người phù hợp nhất.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaComments />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Trò chuyện thời gian thực</h3>
              <p className="text-neutral-600">
                Kết nối và trò chuyện với những người bạn đã match, lên kế hoạch hẹn hò trà sữa. Chia sẻ hình ảnh và cảm xúc ngay lập tức.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaUserFriends />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Cộng đồng trà sữa</h3>
              <p className="text-neutral-600">
                Tham gia vào cộng đồng những người yêu thích trà sữa, chia sẻ kinh nghiệm và khám phá những quán trà sữa mới.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaMapMarkerAlt />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Tìm kiếm theo vị trí</h3>
              <p className="text-neutral-600">
                Tìm kiếm người dùng gần bạn, khám phá những quán trà sữa phổ biến trong khu vực và lên kế hoạch hẹn hò dễ dàng.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={featureVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaUserSecret />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Blind Date</h3>
              <p className="text-neutral-600">
                Trải nghiệm hẹn hò mù với những người có cùng sở thích về trà sữa, tạo nên những cuộc gặp gỡ bất ngờ và thú vị.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-12 bg-yellow-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              Nâng cao
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Tính năng đặc biệt
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Những tính năng nâng cao giúp trải nghiệm của bạn trên BOBACE trở nên đặc biệt hơn
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 flex items-start"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-xl mr-4 flex-shrink-0">
                <FaFilter />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Tìm kiếm nâng cao</h3>
                <p className="text-neutral-600">
                  Lọc người dùng theo sở thích trà sữa cụ thể, vị trí, độ tuổi và nhiều tiêu chí khác để tìm được người phù hợp nhất.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 flex items-start"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-xl mr-4 flex-shrink-0">
                <FaUserCheck />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Xác minh hồ sơ</h3>
                <p className="text-neutral-600">
                  Hệ thống xác minh hồ sơ người dùng để đảm bảo tính xác thực và an toàn cho cộng đồng BOBACE.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 flex items-start"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-xl mr-4 flex-shrink-0">
                <FaBell />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Thông báo thời gian thực</h3>
                <p className="text-neutral-600">
                  Nhận thông báo ngay lập tức khi có người thích bạn, khi có match mới hoặc khi nhận được tin nhắn.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 flex items-start"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-xl mr-4 flex-shrink-0">
                <FaLock />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Chế độ ẩn danh</h3>
                <p className="text-neutral-600">
                  Duyệt hồ sơ người dùng trong chế độ ẩn danh, giúp bạn khám phá mà không để lại dấu vết hoạt động.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 flex items-start"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-xl mr-4 flex-shrink-0">
                <FaSearch />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Gợi ý thông minh</h3>
                <p className="text-neutral-600">
                  Hệ thống AI gợi ý những người dùng phù hợp với sở thích và hoạt động của bạn trên nền tảng.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 flex items-start"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-xl mr-4 flex-shrink-0">
                <FaMobileAlt />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Trải nghiệm đa nền tảng</h3>
                <p className="text-neutral-600">
                  Truy cập BOBACE từ mọi thiết bị với trải nghiệm người dùng được tối ưu hóa cho cả máy tính và di động.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Safety Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              An toàn
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Tính năng bảo mật
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Chúng tôi đặt sự an toàn của người dùng lên hàng đầu với các tính năng bảo mật tiên tiến
            </p>
          </motion.div>

          <div className="bg-yellow-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center mb-8">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-4xl mb-6 md:mb-0 md:mr-8">
                <FaShieldAlt />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-neutral-800 text-center md:text-left">Bảo vệ người dùng</h3>
                <p className="text-neutral-700 text-center md:text-left">
                  BOBACE cam kết bảo vệ người dùng với nhiều lớp bảo mật và tính năng an toàn
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <h4 className="font-bold mb-2 text-yellow-600 flex items-center">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2">1</span>
                  Xác thực tài khoản
                </h4>
                <p className="text-neutral-600 text-sm">
                  Hệ thống xác thực email và số điện thoại để đảm bảo danh tính người dùng.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h4 className="font-bold mb-2 text-yellow-600 flex items-center">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2">2</span>
                  Báo cáo người dùng
                </h4>
                <p className="text-neutral-600 text-sm">
                  Hệ thống báo cáo người dùng vi phạm quy tắc cộng đồng để duy trì môi trường lành mạnh.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h4 className="font-bold mb-2 text-yellow-600 flex items-center">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2">3</span>
                  Chặn người dùng
                </h4>
                <p className="text-neutral-600 text-sm">
                  Khả năng chặn người dùng không mong muốn và kiểm soát ai có thể xem hồ sơ của bạn.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h4 className="font-bold mb-2 text-yellow-600 flex items-center">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2">4</span>
                  Mã hóa dữ liệu
                </h4>
                <p className="text-neutral-600 text-sm">
                  Mã hóa tin nhắn và dữ liệu cá nhân để bảo vệ thông tin riêng tư của người dùng.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <h4 className="font-bold mb-2 text-yellow-600 flex items-center">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2">5</span>
                  Kiểm duyệt nội dung
                </h4>
                <p className="text-neutral-600 text-sm">
                  Hệ thống kiểm duyệt hình ảnh và nội dung để đảm bảo tuân thủ quy tắc cộng đồng.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <h4 className="font-bold mb-2 text-yellow-600 flex items-center">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2">6</span>
                  Đội ngũ hỗ trợ
                </h4>
                <p className="text-neutral-600 text-sm">
                  Đội ngũ hỗ trợ 24/7 sẵn sàng giải quyết các vấn đề về an toàn và bảo mật.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-12 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
              Sắp ra mắt
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tính năng đang phát triển
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Chúng tôi không ngừng cải tiến và phát triển những tính năng mới để nâng cao trải nghiệm của bạn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                <FaRegSmile />
              </div>
              <h3 className="text-xl font-bold mb-2">Trò chơi tương tác</h3>
              <p className="text-white/80">
                Các trò chơi tương tác giúp phá băng và tạo kết nối thú vị giữa những người dùng đã match.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                <FaUserFriends />
              </div>
              <h3 className="text-xl font-bold mb-2">Sự kiện cộng đồng</h3>
              <p className="text-white/80">
                Tổ chức và tham gia các sự kiện cộng đồng tại các quán trà sữa địa phương.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                <FaMugHot />
              </div>
              <h3 className="text-xl font-bold mb-2">Đánh giá quán trà sữa</h3>
              <p className="text-white/80">
                Hệ thống đánh giá và bình chọn các quán trà sữa, giúp cộng đồng khám phá những địa điểm mới.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-800">
              Sẵn sàng trải nghiệm?
            </h2>
            <p className="text-xl mb-8 text-neutral-600">
              Đăng ký ngay hôm nay để khám phá tất cả các tính năng tuyệt vời của BOBACE
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <a 
                href="/register" 
                className="bg-yellow-500 text-white px-8 py-6 rounded-full hover:bg-yellow-600 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Đăng ký miễn phí
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Features;