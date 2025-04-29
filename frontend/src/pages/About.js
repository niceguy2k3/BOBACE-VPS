import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaHeart, FaMugHot, FaCalendarAlt, FaLightbulb, FaHandshake } from 'react-icons/fa';
import logo from '../images/logo2.png';
import Footer from '../components/Footer';

const About = () => {
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
            <img src={logo} alt="BOBACE" className="h-24 md:h-32 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              Về BOBACE
            </h1>
            <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
              Nền tảng kết nối những người yêu thích trà sữa, tạo ra những mối quan hệ đặc biệt dựa trên sở thích chung
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
                Câu chuyện của tôi
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
                Từ ý tưởng đột phá đến hiện thực
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-neutral-700">
              <p>
                BOBACE ra đời từ một khoảnh khắc đột phá vào ngày 22/04/2024. Khi đang nằm trên giường, tôi - Nam Nam - bỗng nhiên nảy ra ý tưởng muốn làm điều gì đó mới mẻ cho bản thân và cho những người thích hẹn hò cũng như yêu thích trà sữa. Tôi nhận ra rằng sở thích chung về đồ uống có thể là khởi đầu tuyệt vời cho những mối quan hệ ý nghĩa - từ tình bạn đến tình yêu.
              </p>
              
              <p>
                Từ ý tưởng đột phá đó, tôi đã tự mình phát triển BOBACE từ con số không, biến nó từ một ý tưởng thành một cộng đồng sôi động với hàng trăm người dùng. Tôi tin rằng những kết nối chân thành bắt đầu từ những điều đơn giản trong cuộc sống - như việc cùng nhau thưởng thức một ly trà sữa.
              </p>
              
              <p>
                Tên gọi BOBACE là sự kết hợp hoàn hảo giữa "BOBA" (trà sữa) và "ACE" (hạng nhất), thể hiện cam kết của tôi trong việc tạo ra trải nghiệm kết nối hạng nhất cho những người yêu thích trà sữa. Mỗi chi tiết trong ứng dụng đều được tôi chăm chút kỹ lưỡng để mang đến trải nghiệm tốt nhất cho người dùng.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
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
              Sứ mệnh & Tầm nhìn
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Định hướng của chúng tôi
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-yellow-100"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={itemVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaLightbulb />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-neutral-800">Sứ mệnh</h3>
              <p className="text-neutral-700">
                Tạo ra một nền tảng an toàn, thân thiện và hiệu quả để kết nối những người có chung niềm đam mê với trà sữa, giúp họ xây dựng những mối quan hệ ý nghĩa dựa trên sở thích chung.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-yellow-100"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={itemVariant}
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaHeart />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-neutral-800">Tầm nhìn</h3>
              <p className="text-neutral-700">
                Trở thành nền tảng hàng đầu trong việc kết nối những người có sở thích chung, mở rộng từ trà sữa đến nhiều lĩnh vực khác, tạo ra một cộng đồng đa dạng và gắn kết.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
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
              Giá trị cốt lõi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Những giá trị chúng tôi theo đuổi
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              variants={itemVariant}
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-2xl mb-4">
                <FaUsers />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800">Cộng đồng</h3>
              <p className="text-neutral-600">
                Xây dựng một cộng đồng thân thiện, tôn trọng và hỗ trợ lẫn nhau, nơi mọi người đều cảm thấy được chào đón.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              variants={itemVariant}
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-2xl mb-4">
                <FaMugHot />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800">Đam mê</h3>
              <p className="text-neutral-600">
                Chia sẻ niềm đam mê với trà sữa và tạo điều kiện để mọi người kết nối thông qua sở thích chung này.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              variants={itemVariant}
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500 text-2xl mb-4">
                <FaHandshake />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800">Tin cậy</h3>
              <p className="text-neutral-600">
                Đảm bảo một môi trường an toàn, bảo mật và đáng tin cậy cho tất cả người dùng trên nền tảng.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
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
              Hành trình phát triển
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Những cột mốc quan trọng
            </h2>
          </motion.div>
      
          <div className="max-w-4xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-yellow-200 transform md:translate-x-[-50%] hidden md:block"></div>
      
            {/* Timeline items */}
            <motion.div 
              className="space-y-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div 
                className="flex flex-col md:flex-row items-center"
                variants={itemVariant}
              >
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 inline-block">
                    <h3 className="text-xl font-bold mb-2 text-yellow-600">22 tháng 4, 2024</h3>
                    <h4 className="text-lg font-semibold mb-2">Khoảnh khắc Eureka</h4>
                    <p className="text-neutral-600">
                      Khi đang nằm trên giường, Nam Nam bỗng nảy ra ý tưởng tạo một nền tảng kết nối những người yêu thích trà sữa và hẹn hò.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 hidden md:block">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg relative z-10 transform md:translate-x-[-50%]">
                    <FaCalendarAlt />
                  </div>
                </div>
              </motion.div>
      
              <motion.div 
                className="flex flex-col md:flex-row items-center"
                variants={itemVariant}
              >
                <div className="md:w-1/2 md:pr-12 hidden md:block">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg ml-auto relative z-10 transform md:translate-x-[50%]">
                    <FaCalendarAlt />
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 md:text-left mb-4 md:mb-0">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 inline-block">
                    <h3 className="text-xl font-bold mb-2 text-yellow-600">Tháng 5, 2024</h3>
                    <h4 className="text-lg font-semibold mb-2">Bắt đầu phát triển</h4>
                    <p className="text-neutral-600">
                      Nam Nam bắt đầu tự mình phát triển nền tảng BOBACE từ con số không, với quyết tâm biến ý tưởng thành hiện thực.
                    </p>
                  </div>
                </div>
              </motion.div>
      
              <motion.div 
                className="flex flex-col md:flex-row items-center"
                variants={itemVariant}
              >
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 inline-block">
                    <h3 className="text-xl font-bold mb-2 text-yellow-600">Tháng 8, 2024</h3>
                    <h4 className="text-lg font-semibold mb-2">Ra mắt phiên bản beta</h4>
                    <p className="text-neutral-600">
                      BOBACE chính thức ra mắt phiên bản beta với nhóm người dùng thử nghiệm đầu tiên, nhận được phản hồi tích cực. Nếu bạn thấy số lượng người dùng hiện tại ít, đó là vì chúng tôi đã xóa dữ liệu người dùng thử nghiệm cũ để chuẩn bị cho bản phát hành chính thức.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 hidden md:block">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg relative z-10 transform md:translate-x-[-50%]">
                    <FaCalendarAlt />
                  </div>
                </div>
              </motion.div>
      
              <motion.div 
                className="flex flex-col md:flex-row items-center"
                variants={itemVariant}
              >
                <div className="md:w-1/2 md:pr-12 hidden md:block">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg ml-auto relative z-10 transform md:translate-x-[50%]">
                    <FaCalendarAlt />
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 md:text-left">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 inline-block">
                    <h3 className="text-xl font-bold mb-2 text-yellow-600">25 Tháng 04, 2025</h3>
                    <h4 className="text-lg font-semibold mb-2">Phát hành chính thức</h4>
                    <p className="text-neutral-600">
                      Sau nhiều tháng phát triển và cải tiến một mình, Nam Nam chính thức ra mắt BOBACE cho công chúng, đánh dấu một cột mốc quan trọng.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
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
              Người sáng lập
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Người sáng lập duy nhất
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              BOBACE được phát triển từ đầu đến cuối bởi một người duy nhất
            </p>
          </motion.div>

          <motion.div 
            className="max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md border border-yellow-100 text-center max-w-md mx-auto"
              variants={itemVariant}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-32 h-32 rounded-full bg-yellow-100 mx-auto mb-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-4xl font-bold">
                  N
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-neutral-800">Nam Nam</h3>
              <p className="text-yellow-600 mb-4 text-lg">Người sáng lập & Nhà phát triển</p>
              <p className="text-neutral-600 text-lg">
                Người đam mê trà sữa và công nghệ, đã tự mình phát triển toàn bộ nền tảng BOBACE từ ý tưởng đến hiện thực. Với niềm đam mê kết nối mọi người thông qua sở thích chung, Nam Nam đã xây dựng BOBACE để trở thành nơi gặp gỡ lý tưởng cho những người yêu thích trà sữa.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tham gia cùng chúng tôi ngay hôm nay
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Khám phá thế giới của những người yêu thích trà sữa và tìm kiếm những kết nối đặc biệt
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <a 
                href="/register" 
                className="bg-white text-yellow-600 px-8 py-6 rounded-full hover:bg-yellow-50 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Đăng ký ngay
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;