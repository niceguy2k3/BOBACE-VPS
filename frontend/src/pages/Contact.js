import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
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
              Liên hệ
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              Kết nối với tôi
            </h1>
            <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
              Tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với tôi nếu bạn có bất kỳ câu hỏi hoặc góp ý nào.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-2xl mx-auto mb-4">
                <FaEnvelope />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800">Email</h3>
              <p className="text-neutral-600 mb-3">Gửi email cho tôi</p>
              <a href="mailto:contact@bobace.com" className="text-yellow-600 hover:text-yellow-700 font-medium">
                contact@bobace.com
              </a>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-2xl mx-auto mb-4">
                <FaPhone />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800">Điện thoại</h3>
              <p className="text-neutral-600 mb-3">Gọi cho tôi</p>
              <a href="tel:+84901234567" className="text-yellow-600 hover:text-yellow-700 font-medium">
                +84 33 533 7843
              </a>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-2xl mx-auto mb-4">
                <FaMapMarkerAlt />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800">Địa chỉ</h3>
              <p className="text-neutral-600 mb-3">Văn phòng của tôi</p>
              <p className="text-yellow-600 font-medium">
                Quận 7, TP.HCM
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-8 text-white">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Hãy nói chuyện với tôi</h2>
                  <p className="mb-8 text-white/90">
                    Tôi rất mong muốn được nghe từ bạn. Hãy điền vào biểu mẫu và tôi sẽ liên hệ lại trong thời gian sớm nhất.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <FaEnvelope className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-white/80">contact@bobace.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <FaPhone className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Điện thoại</h3>
                        <p className="text-white/80">+84 33 533 7843</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Địa chỉ</h3>
                        <p className="text-white/80">Quận 7, TP.HCM</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12">
                    <h3 className="font-medium mb-4">Kết nối với tôi</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300">
                        <FaFacebook className="text-white" />
                      </a>
                      <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300">
                        <FaTwitter className="text-white" />
                      </a>
                      <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300">
                        <FaInstagram className="text-white" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-neutral-800">Gửi tin nhắn cho tôi</h2>
                  
                  {isSubmitted ? (
                    <motion.div 
                      className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-700 mb-2">Cảm ơn bạn!</h3>
                      <p className="text-green-600">
                        Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                          {error}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-neutral-700 font-medium mb-2">Họ và tên</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-colors duration-300"
                          placeholder="Nhập họ và tên của bạn"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-neutral-700 font-medium mb-2">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-colors duration-300"
                          placeholder="Nhập địa chỉ email của bạn"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="subject" className="block text-neutral-700 font-medium mb-2">Tiêu đề</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-colors duration-300"
                          placeholder="Nhập tiêu đề tin nhắn"
                          required
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="message" className="block text-neutral-700 font-medium mb-2">Tin nhắn</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows="5"
                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-colors duration-300"
                          placeholder="Nhập nội dung tin nhắn của bạn"
                          required
                        ></textarea>
                      </div>
                      
                      <motion.button
                        type="submit"
                        className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center justify-center font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="mr-2" /> Gửi tin nhắn
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62719.335514719605!2d106.68716408016546!3d10.737684318195994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752560b050b093%3A0x6dcb89c51055ccc9!2zUXXhuq1uIDcsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1745465779522!5m2!1svi!2s" 
                  width="100%" 
                  height="450" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="BOBACE Office Location"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
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
              Câu hỏi thường gặp
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Những câu hỏi phổ biến về dịch vụ của tôi
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
              <h3 className="text-lg font-bold mb-2 text-neutral-800">Làm thế nào để tôi có thể liên hệ với đội hỗ trợ?</h3>
              <p className="text-neutral-600">
                Bạn có thể liên hệ với tôi qua email contact@bobace.com, số điện thoại +84 33 533 7843 hoặc thông qua biểu mẫu liên hệ trên trang web.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">Thời gian phản hồi của đội ngũ hỗ trợ là bao lâu?</h3>
              <p className="text-neutral-600">
                Chúng tôi cố gắng phản hồi tất cả các yêu cầu trong vòng 24 giờ. Đối với các vấn đề khẩn cấp, thời gian phản hồi có thể nhanh hơn.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">Làm thế nào để báo cáo một vấn đề kỹ thuật?</h3>
              <p className="text-neutral-600">
                Để báo cáo vấn đề kỹ thuật, bạn có thể gửi email đến support@bobace.com với tiêu đề "Technical Issue" và mô tả chi tiết về vấn đề bạn đang gặp phải.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border border-yellow-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-2 text-neutral-800">Tôi có thể đề xuất tính năng mới cho BOBACE không?</h3>
              <p className="text-neutral-600">
                Chúng tôi luôn hoan nghênh những ý kiến đóng góp từ người dùng. Bạn có thể gửi đề xuất tính năng mới thông qua biểu mẫu liên hệ hoặc email đến ideas@bobace.com.
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
              Tôi luôn sẵn sàng lắng nghe
            </h2>
            <p className="text-xl mb-8 text-neutral-600">
              Đừng ngần ngại liên hệ với tôi nếu bạn có bất kỳ câu hỏi nào
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <a 
                href="mailto:contact@bobace.com" 
                className="bg-yellow-500 text-white px-8 py-6 rounded-full hover:bg-yellow-600 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <FaEnvelope className="mr-2" /> Gửi email cho tôi
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;