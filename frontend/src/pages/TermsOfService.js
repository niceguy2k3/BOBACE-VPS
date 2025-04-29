import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt, FaExclamationTriangle, FaUserShield, FaGavel, FaHandshake } from 'react-icons/fa';
import Footer from '../components/Footer';

const TermsOfService = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      {/* Header Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Link to="/legal" className="inline-flex items-center text-yellow-600 hover:text-yellow-700 mb-6">
            <FaArrowLeft className="mr-2" /> Quay lại trang Pháp lý
          </Link>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-2xl mr-4">
                <FaFileAlt />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                Điều khoản sử dụng
              </h1>
            </div>
            
            <div className="bg-yellow-100/50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-neutral-700">
                <strong>Cập nhật lần cuối:</strong> Ngày 15 tháng 3 năm 2024
              </p>
            </div>
            
            <p className="text-lg text-neutral-700 mb-8 leading-relaxed">
              Vui lòng đọc kỹ các Điều khoản sử dụng này trước khi sử dụng nền tảng BOBACE. Bằng việc truy cập hoặc sử dụng nền tảng của chúng tôi, bạn đồng ý bị ràng buộc bởi các điều khoản và điều kiện này.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8 border border-yellow-100">
            <h2 className="text-xl font-bold mb-4 text-neutral-800">Mục lục</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('section-1')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  1. Giới thiệu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-2')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  2. Điều kiện sử dụng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-3')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  3. Tài khoản người dùng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-4')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  4. Nội dung người dùng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-5')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  5. Quyền sở hữu trí tuệ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-6')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  6. Giới hạn trách nhiệm
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-7')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  7. Chấm dứt
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-8')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  8. Luật áp dụng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-9')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  9. Thay đổi điều khoản
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-10')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  10. Liên hệ
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg prose-yellow">
            <div id="section-1" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaHandshake />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">1. Giới thiệu</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  BOBACE ("chúng tôi", "của chúng tôi") là nền tảng kết nối những người yêu thích trà sữa, được vận hành bởi Công ty TNHH BOBACE. Bằng việc truy cập hoặc sử dụng trang web, ứng dụng di động hoặc bất kỳ dịch vụ nào khác của chúng tôi (gọi chung là "Dịch vụ"), bạn đồng ý rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này.
                </p>
                <p>
                  Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được phép truy cập hoặc sử dụng Dịch vụ của chúng tôi.
                </p>
              </div>
            </div>

            <div id="section-2" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaExclamationTriangle />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">2. Điều kiện sử dụng</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Để sử dụng Dịch vụ của chúng tôi, bạn phải đáp ứng các điều kiện sau:
                </p>
                <ul>
                  <li>Bạn phải ít nhất 18 tuổi hoặc đủ tuổi hợp pháp tại quốc gia của bạn để sử dụng Dịch vụ.</li>
                  <li>Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi được yêu cầu.</li>
                  <li>Bạn không được sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp hoặc trái phép nào.</li>
                  <li>Bạn không được vi phạm bất kỳ luật hoặc quy định nào áp dụng tại địa phương, quốc gia hoặc quốc tế.</li>
                  <li>Bạn không được cố gắng can thiệp vào hoạt động bình thường của Dịch vụ.</li>
                </ul>
                <p>
                  Chúng tôi có quyền từ chối cung cấp Dịch vụ cho bất kỳ ai vì bất kỳ lý do gì vào bất kỳ lúc nào.
                </p>
              </div>
            </div>

            <div id="section-3" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaUserShield />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">3. Tài khoản người dùng</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Khi bạn tạo tài khoản với chúng tôi, bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của bạn, và bạn đồng ý chấp nhận trách nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của bạn.
                </p>
                <p>
                  Bạn đồng ý thông báo cho chúng tôi ngay lập tức về bất kỳ việc sử dụng trái phép tài khoản của bạn hoặc bất kỳ vi phạm bảo mật nào khác. Chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất hoặc thiệt hại nào phát sinh từ việc bạn không tuân thủ các yêu cầu này.
                </p>
                <p>
                  Chúng tôi có quyền vô hiệu hóa bất kỳ tên người dùng, mật khẩu hoặc mã định danh nào, cho dù do bạn chọn hay do chúng tôi cung cấp, vào bất kỳ lúc nào nếu theo ý kiến hợp lý của chúng tôi, bạn đã vi phạm bất kỳ điều khoản nào của Điều khoản sử dụng này.
                </p>
              </div>
            </div>

            <div id="section-4" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaFileAlt />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">4. Nội dung người dùng</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Dịch vụ của chúng tôi cho phép bạn đăng, liên kết, lưu trữ, chia sẻ và cung cấp thông tin, văn bản, đồ họa, video hoặc các tài liệu khác ("Nội dung"). Bạn chịu trách nhiệm về Nội dung mà bạn đăng trên hoặc thông qua Dịch vụ, bao gồm tính hợp pháp, độ tin cậy, tính phù hợp và quyền sở hữu của nó.
                </p>
                <p>
                  Bằng cách đăng Nội dung trên hoặc thông qua Dịch vụ, bạn tuyên bố và đảm bảo rằng:
                </p>
                <ul>
                  <li>Nội dung là của bạn hoặc bạn có quyền sử dụng nó và cấp cho chúng tôi các quyền và giấy phép như được quy định trong các Điều khoản này.</li>
                  <li>Việc đăng Nội dung của bạn trên hoặc thông qua Dịch vụ không vi phạm quyền riêng tư, quyền công khai, bản quyền, quyền hợp đồng hoặc bất kỳ quyền nào khác của bất kỳ người nào.</li>
                  <li>Nội dung không chứa bất kỳ thông tin nào là bất hợp pháp, xúc phạm, khiêu dâm, đe dọa, quấy rối, lạm dụng, phỉ báng hoặc gây hiểu lầm.</li>
                </ul>
                <p>
                  Chúng tôi có quyền, nhưng không có nghĩa vụ, giám sát và chỉnh sửa hoặc xóa bất kỳ Nội dung nào. Chúng tôi không chịu trách nhiệm hoặc nghĩa vụ pháp lý đối với bất kỳ Nội dung nào do bạn hoặc bất kỳ bên thứ ba nào đăng.
                </p>
              </div>
            </div>

            <div id="section-5" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaGavel />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">5. Quyền sở hữu trí tuệ</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Dịch vụ và nội dung gốc của nó (không bao gồm Nội dung do người dùng cung cấp), các tính năng và chức năng là và sẽ vẫn là tài sản độc quyền của BOBACE và các bên cấp phép của nó. Dịch vụ được bảo vệ bởi bản quyền, thương hiệu và các luật khác của Việt Nam và các quốc gia khác. Thương hiệu, logo, tên thương mại và hình thức thương mại của chúng tôi không được sử dụng mà không có sự đồng ý trước bằng văn bản của chúng tôi.
                </p>
                <p>
                  Bạn giữ lại bất kỳ quyền nào mà bạn đã có đối với Nội dung mà bạn đăng, tải lên, chia sẻ hoặc truyền tải cho hoặc thông qua Dịch vụ. Bằng cách đăng Nội dung, bạn cấp cho chúng tôi giấy phép toàn cầu, không độc quyền, miễn phí bản quyền, có thể chuyển nhượng và có thể cấp phép lại để sử dụng, sao chép, sửa đổi, phân phối, chuẩn bị các tác phẩm phái sinh, hiển thị và thực hiện Nội dung đó liên quan đến Dịch vụ và hoạt động kinh doanh của BOBACE, bao gồm nhưng không giới hạn ở việc quảng bá và phân phối lại một phần hoặc toàn bộ Dịch vụ.
                </p>
              </div>
            </div>

            <div id="section-6" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaExclamationTriangle />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">6. Giới hạn trách nhiệm</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Trong phạm vi tối đa được pháp luật cho phép, BOBACE, các giám đốc, nhân viên, đối tác, đại lý, nhà cung cấp hoặc chi nhánh của nó sẽ không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hậu quả hoặc mang tính trừng phạt nào, bao gồm nhưng không giới hạn ở, mất lợi nhuận, dữ liệu, sử dụng, uy tín hoặc các tổn thất vô hình khác, phát sinh từ hoặc liên quan đến:
                </p>
                <ul>
                  <li>Việc bạn truy cập hoặc sử dụng hoặc không thể truy cập hoặc sử dụng Dịch vụ;</li>
                  <li>Bất kỳ hành vi hoặc nội dung nào của bất kỳ bên thứ ba nào trên Dịch vụ;</li>
                  <li>Bất kỳ nội dung nào có được từ Dịch vụ; và</li>
                  <li>Truy cập, sử dụng hoặc thay đổi trái phép các bài đăng hoặc tài khoản của bạn.</li>
                </ul>
                <p>
                  Giới hạn trách nhiệm này sẽ áp dụng cho dù thiệt hại phát sinh theo hợp đồng, vi phạm, sơ suất, trách nhiệm nghiêm ngặt hoặc bất kỳ lý thuyết pháp lý nào khác, và cho dù chúng tôi đã được thông báo về khả năng xảy ra thiệt hại đó hay không.
                </p>
              </div>
            </div>

            <div id="section-7" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaGavel />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">7. Chấm dứt</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi có thể chấm dứt hoặc đình chỉ tài khoản của bạn và cấm truy cập vào Dịch vụ ngay lập tức, mà không cần thông báo trước hoặc trách nhiệm, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở, vi phạm Điều khoản sử dụng.
                </p>
                <p>
                  Nếu bạn muốn chấm dứt tài khoản của mình, bạn có thể đơn giản ngừng sử dụng Dịch vụ. Tuy nhiên, nếu bạn muốn xóa tài khoản của mình, bạn có thể làm như vậy bằng cách vào phần Cài đặt và chọn tùy chọn xóa tài khoản.
                </p>
                <p>
                  Tất cả các điều khoản của Điều khoản sử dụng này, theo bản chất của chúng, sẽ tiếp tục có hiệu lực sau khi chấm dứt, bao gồm nhưng không giới hạn ở, các điều khoản về quyền sở hữu, từ chối bảo đảm, bồi thường và giới hạn trách nhiệm.
                </p>
              </div>
            </div>

            <div id="section-8" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaGavel />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">8. Luật áp dụng</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Các Điều khoản sử dụng này sẽ được điều chỉnh và giải thích theo luật pháp của Việt Nam, mà không tính đến các quy định về xung đột pháp luật.
                </p>
                <p>
                  Việc không thực thi bất kỳ quyền hoặc điều khoản nào của các Điều khoản sử dụng này sẽ không được coi là từ bỏ các quyền đó. Nếu bất kỳ điều khoản nào của các Điều khoản sử dụng này được tòa án có thẩm quyền xác định là không hợp lệ hoặc không thể thực thi, các bên vẫn đồng ý rằng tòa án sẽ cố gắng thực hiện ý định của các bên như được phản ánh trong điều khoản đó, và các điều khoản khác của các Điều khoản sử dụng này vẫn sẽ có đầy đủ hiệu lực và hiệu quả.
                </p>
              </div>
            </div>

            <div id="section-9" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaFileAlt />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">9. Thay đổi điều khoản</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi có quyền, theo quyết định riêng của mình, sửa đổi hoặc thay thế các Điều khoản sử dụng này vào bất kỳ lúc nào. Nếu sửa đổi là quan trọng, chúng tôi sẽ cố gắng cung cấp thông báo trước ít nhất 30 ngày trước khi bất kỳ điều khoản mới nào có hiệu lực. Việc xác định sửa đổi nào là quan trọng sẽ được thực hiện theo quyết định riêng của chúng tôi.
                </p>
                <p>
                  Bằng cách tiếp tục truy cập hoặc sử dụng Dịch vụ của chúng tôi sau khi những sửa đổi đó có hiệu lực, bạn đồng ý bị ràng buộc bởi các điều khoản đã sửa đổi. Nếu bạn không đồng ý với các điều khoản mới, vui lòng ngừng sử dụng Dịch vụ.
                </p>
              </div>
            </div>

            <div id="section-10" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaHandshake />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">10. Liên hệ</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
                </p>
                <ul>
                  <li>Email: legal@bobace.com</li>
                  <li>Địa chỉ: Quận 7, TP.HCM</li>
                  <li>Điện thoại: +84 33 533 7843</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Bạn có câu hỏi về điều khoản sử dụng?
              </h2>
              <p className="text-xl text-white/90 mb-6">
                Đội ngũ pháp lý của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn
              </p>
              <Link 
                to="/contact" 
                className="inline-block px-8 py-6 bg-white text-yellow-600 rounded-full hover:bg-yellow-50 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Liên hệ với chúng tôi
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;