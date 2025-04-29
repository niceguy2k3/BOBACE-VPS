  import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaShieldAlt, FaCookieBite, FaGavel } from 'react-icons/fa';
import Footer from '../components/Footer';

const Legal = () => {
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
  
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
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
              Pháp lý
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              Thông tin pháp lý
            </h1>
            <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
              Tất cả các thông tin pháp lý liên quan đến việc sử dụng nền tảng BOBACE
            </p>
          </motion.div>
        </div>
      </section>

      {/* Legal Documents Section */}
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
              Tài liệu pháp lý
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Những tài liệu pháp lý quan trọng bạn cần biết khi sử dụng BOBACE
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={itemVariant}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaFileAlt />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Điều khoản sử dụng</h3>
              <p className="text-neutral-600 mb-6">
                Quy định về việc sử dụng nền tảng BOBACE, bao gồm quyền và trách nhiệm của người dùng.
              </p>
              <Link 
                to="/terms-of-service" 
                className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300"
              >
                Xem chi tiết
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={itemVariant}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaShieldAlt />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Chính sách bảo mật</h3>
              <p className="text-neutral-600 mb-6">
                Cách tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của người dùng.
              </p>
              <Link 
                to="/privacy-policy" 
                className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300"
              >
                Xem chi tiết
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={itemVariant}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaCookieBite />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Chính sách cookie</h3>
              <p className="text-neutral-600 mb-6">
                Thông tin về cách tôi sử dụng cookie và các công nghệ theo dõi khác.
              </p>
              <Link 
                to="/cookie-policy" 
                className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300"
              >
                Xem chi tiết
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-xl"
              variants={itemVariant}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaGavel />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Quy tắc cộng đồng</h3>
              <p className="text-neutral-600 mb-6">
                Hướng dẫn về hành vi được chấp nhận và không được chấp nhận trên nền tảng BOBACE.
              </p>
              <Link 
                to="/community-guidelines" 
                className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300"
              >
                Xem chi tiết
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Legal FAQ Section */}
      <section className="py-12 bg-yellow-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Câu hỏi thường gặp về pháp lý
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Những câu hỏi phổ biến về các vấn đề pháp lý khi sử dụng BOBACE
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">BOBACE thu thập những thông tin cá nhân nào?</h3>
              <p className="text-neutral-600">
                BOBACE thu thập các thông tin cá nhân như tên, email, số điện thoại, vị trí địa lý, sở thích về trà sữa và các thông tin khác mà bạn cung cấp trong hồ sơ của mình. Chi tiết đầy đủ có thể được tìm thấy trong Chính sách bảo mật của tôi.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">Làm thế nào để tôi có thể xóa tài khoản của mình?</h3>
              <p className="text-neutral-600">
                Bạn có thể xóa tài khoản của mình bằng cách vào phần Cài đặt, chọn "Quản lý tài khoản" và nhấp vào "Xóa tài khoản". Lưu ý rằng việc xóa tài khoản là không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">BOBACE có chia sẻ thông tin của tôi với bên thứ ba không?</h3>
              <p className="text-neutral-600">
                BOBACE không bán thông tin cá nhân của bạn cho bên thứ ba. Tuy nhiên, tôi có thể chia sẻ thông tin với các đối tác dịch vụ để cung cấp và cải thiện dịch vụ. Chi tiết về việc chia sẻ dữ liệu có thể được tìm thấy trong Chính sách bảo mật.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">Làm thế nào để báo cáo nội dung vi phạm?</h3>
              <p className="text-neutral-600">
                Bạn có thể báo cáo nội dung vi phạm bằng cách nhấp vào biểu tượng "Báo cáo" trên hồ sơ người dùng hoặc tin nhắn. Tôi sẽ xem xét báo cáo và thực hiện các biện pháp thích hợp theo Quy tắc cộng đồng.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">Tôi có quyền gì đối với dữ liệu cá nhân của mình?</h3>
              <p className="text-neutral-600">
                Bạn có quyền truy cập, chỉnh sửa, xóa và giới hạn việc xử lý dữ liệu cá nhân của mình. Bạn cũng có thể yêu cầu bản sao dữ liệu của mình. Để thực hiện các quyền này, vui lòng liên hệ với tôi qua privacy@bobace.com.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact for Legal Matters */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="max-w-4xl mx-auto bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-8 text-white shadow-lg"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Cần hỗ trợ về vấn đề pháp lý?
              </h2>
              <p className="text-xl text-white/90">
                Nếu bạn có bất kỳ câu hỏi nào về các vấn đề pháp lý, vui lòng liên hệ với tôi
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
              <a 
                href="mailto:legal@bobace.com" 
                className="bg-white text-yellow-600 px-8 py-6 rounded-full hover:bg-yellow-50 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full md:w-auto text-center"
              >
                legal@bobace.com
              </a>
              <a 
                href="tel:+84901234567" 
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-6 rounded-full hover:bg-white/30 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full md:w-auto text-center"
              >
                +84 33 533 7843
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Updates Section */}
      <section className="py-12 bg-yellow-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              Cập nhật
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Cập nhật chính sách
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Chúng tôi thường xuyên cập nhật các chính sách để đảm bảo tính minh bạch và tuân thủ pháp luật
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-200 hidden md:block"></div>

              {/* Timeline items */}
              <div className="space-y-8">
                <motion.div 
                  className="flex flex-col md:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="md:w-1/4 mb-4 md:mb-0 flex md:justify-end md:pr-8 relative">
                    <div className="hidden md:block absolute right-0 w-4 h-4 bg-yellow-500 rounded-full transform translate-x-1/2 mt-1.5"></div>
                    <div className="md:hidden w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-4">
                      1
                    </div>
                    <div className="md:text-right">
                      <span className="text-yellow-600 font-bold">Tháng 3, 2024</span>
                    </div>
                  </div>
                  <div className="md:w-3/4 md:pl-8 bg-white p-5 rounded-xl shadow-sm border border-yellow-100">
                    <h3 className="font-bold text-neutral-800">Cập nhật Chính sách bảo mật</h3>
                    <p className="text-neutral-600 mt-2">
                      Cập nhật để làm rõ cách tôi xử lý dữ liệu vị trí và tăng cường các biện pháp bảo mật.
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex flex-col md:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="md:w-1/4 mb-4 md:mb-0 flex md:justify-end md:pr-8 relative">
                    <div className="hidden md:block absolute right-0 w-4 h-4 bg-yellow-500 rounded-full transform translate-x-1/2 mt-1.5"></div>
                    <div className="md:hidden w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-4">
                      2
                    </div>
                    <div className="md:text-right">
                      <span className="text-yellow-600 font-bold">Tháng 2, 2024</span>
                    </div>
                  </div>
                  <div className="md:w-3/4 md:pl-8 bg-white p-5 rounded-xl shadow-sm border border-yellow-100">
                    <h3 className="font-bold text-neutral-800">Cập nhật Điều khoản sử dụng</h3>
                    <p className="text-neutral-600 mt-2">
                      Bổ sung các điều khoản mới về việc sử dụng tính năng Blind Date và cập nhật quy định về nội dung người dùng.
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex flex-col md:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="md:w-1/4 mb-4 md:mb-0 flex md:justify-end md:pr-8 relative">
                    <div className="hidden md:block absolute right-0 w-4 h-4 bg-yellow-500 rounded-full transform translate-x-1/2 mt-1.5"></div>
                    <div className="md:hidden w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-4">
                      3
                    </div>
                    <div className="md:text-right">
                      <span className="text-yellow-600 font-bold">Tháng 12, 2023</span>
                    </div>
                  </div>
                  <div className="md:w-3/4 md:pl-8 bg-white p-5 rounded-xl shadow-sm border border-yellow-100">
                    <h3 className="font-bold text-neutral-800">Cập nhật Chính sách cookie</h3>
                    <p className="text-neutral-600 mt-2">
                      Cập nhật danh sách cookie được sử dụng và cung cấp thêm thông tin về cách quản lý cookie trên trình duyệt.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
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
              Bạn đã sẵn sàng?
            </h2>
            <p className="text-xl mb-8 text-neutral-600">
              Đăng ký ngay hôm nay để trải nghiệm BOBACE - nền tảng kết nối những người yêu thích trà sữa
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link 
                to="/register" 
                className="bg-yellow-500 text-white px-8 py-6 rounded-full hover:bg-yellow-600 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Đăng ký ngay
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Legal;