import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCookieBite, FaInfoCircle, FaClipboardList, FaUserShield, FaGlobe, FaExclamationTriangle } from 'react-icons/fa';
import Footer from '../components/Footer';

const CookiePolicy = () => {
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
                <FaCookieBite />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                Chính sách cookie
              </h1>
            </div>
            
            <div className="bg-yellow-100/50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-neutral-700">
                <strong>Cập nhật lần cuối:</strong> Ngày 15 tháng 3 năm 2024
              </p>
            </div>
            
            <p className="text-lg text-neutral-700 mb-8 leading-relaxed">
              Chính sách cookie này giải thích cách BOBACE sử dụng cookie và các công nghệ tương tự để nhận dạng bạn khi bạn truy cập trang web và ứng dụng của tôi. Nó giải thích cookie là gì, cách tôi sử dụng chúng, các loại cookie tôi sử dụng, và cách bạn có thể kiểm soát cookie.
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
                  1. Cookie là gì?
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-2')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  2. Cách tôi sử dụng cookie
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-3')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  3. Các loại cookie tôi sử dụng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-4')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  4. Quản lý cookie
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-5')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  5. Cookie của bên thứ ba
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-6')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  6. Thay đổi chính sách
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-7')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  7. Liên hệ
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg prose-yellow">
            <div id="section-1" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaInfoCircle />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">1. Cookie là gì?</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Cookie là các tệp văn bản nhỏ được lưu trữ trên máy tính, điện thoại thông minh hoặc thiết bị khác của bạn khi bạn truy cập một trang web. Cookie được sử dụng rộng rãi để làm cho các trang web hoạt động hiệu quả hơn, cũng như để cung cấp thông tin cho chủ sở hữu trang web.
                </p>
                <p>
                  Cookie cho phép trang web nhận dạng thiết bị của bạn và ghi nhớ thông tin về lượt truy cập của bạn, chẳng hạn như ngôn ngữ ưa thích, kích thước phông chữ và các tùy chọn hiển thị khác. Điều này có thể làm cho lần truy cập tiếp theo của bạn dễ dàng hơn và trang web hữu ích hơn đối với bạn.
                </p>
                <p>
                  Ngoài cookie, chúng tôi cũng có thể sử dụng các công nghệ tương tự như web beacon, pixel, và local storage để thu thập và lưu trữ thông tin về cách bạn sử dụng trang web và ứng dụng của chúng tôi.
                </p>
              </div>
            </div>

            <div id="section-2" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaClipboardList />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">2. Cách chúng tôi sử dụng cookie</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi sử dụng cookie và các công nghệ tương tự cho nhiều mục đích khác nhau, bao gồm:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.1. Cải thiện trải nghiệm người dùng</h3>
                <p>
                  Cookie giúp chúng tôi cung cấp trải nghiệm tốt hơn và cá nhân hóa hơn cho bạn. Chúng cho phép chúng tôi:
                </p>
                <ul>
                  <li>Ghi nhớ thông tin đăng nhập của bạn để bạn không phải nhập lại mỗi khi truy cập trang web.</li>
                  <li>Ghi nhớ các tùy chọn và sở thích của bạn, chẳng hạn như ngôn ngữ ưa thích hoặc kích thước phông chữ.</li>
                  <li>Cá nhân hóa nội dung và trải nghiệm của bạn dựa trên sở thích và hành vi của bạn.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.2. Phân tích và hiệu suất</h3>
                <p>
                  Cookie giúp chúng tôi hiểu cách người dùng tương tác với trang web của chúng tôi, cho phép chúng tôi cải thiện cách trang web hoạt động. Chúng cho phép chúng tôi:
                </p>
                <ul>
                  <li>Thu thập thông tin về cách người dùng sử dụng trang web của chúng tôi.</li>
                  <li>Phát hiện và sửa lỗi.</li>
                  <li>Kiểm tra các thiết kế và tính năng mới.</li>
                  <li>Theo dõi hiệu suất trang web và xác định các lĩnh vực cần cải thiện.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.3. Quảng cáo và tiếp thị</h3>
                <p>
                  Cookie giúp chúng tôi cung cấp quảng cáo phù hợp hơn và đo lường hiệu quả của các chiến dịch tiếp thị của chúng tôi. Chúng cho phép chúng tôi:
                </p>
                <ul>
                  <li>Hiển thị quảng cáo phù hợp với sở thích của bạn.</li>
                  <li>Đo lường hiệu quả của các chiến dịch quảng cáo.</li>
                  <li>Tránh hiển thị cùng một quảng cáo quá nhiều lần.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.4. Bảo mật</h3>
                <p>
                  Cookie giúp chúng tôi phát hiện, ngăn chặn và ứng phó với các hoạt động gian lận và vi phạm bảo mật khác. Chúng cho phép chúng tôi:
                </p>
                <ul>
                  <li>Xác minh danh tính của bạn.</li>
                  <li>Bảo vệ dữ liệu của bạn khỏi truy cập trái phép.</li>
                  <li>Phát hiện và ngăn chặn các hoạt động gian lận và lạm dụng.</li>
                </ul>
              </div>
            </div>

            <div id="section-3" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaCookieBite />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">3. Các loại cookie chúng tôi sử dụng</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi sử dụng các loại cookie sau:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.1. Cookie cần thiết</h3>
                <p>
                  Cookie cần thiết là những cookie mà trang web không thể hoạt động đúng cách nếu không có chúng. Chúng cho phép bạn di chuyển xung quanh trang web và sử dụng các tính năng thiết yếu như khu vực an toàn và giỏ hàng. Những cookie này không thu thập thông tin về bạn có thể được sử dụng cho mục đích tiếp thị. Bạn không thể từ chối những cookie này vì trang web không thể hoạt động đúng cách nếu không có chúng.
                </p>
                <p>
                  Ví dụ về cookie cần thiết mà chúng tôi sử dụng:
                </p>
                <ul>
                  <li><strong>session_id</strong>: Được sử dụng để duy trì phiên của bạn và cho phép bạn đăng nhập vào tài khoản của mình.</li>
                  <li><strong>csrf_token</strong>: Được sử dụng để ngăn chặn các cuộc tấn công giả mạo yêu cầu trên trang (CSRF).</li>
                  <li><strong>cookie_consent</strong>: Được sử dụng để ghi nhớ lựa chọn của bạn về việc chấp nhận cookie.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.2. Cookie hiệu suất</h3>
                <p>
                  Cookie hiệu suất thu thập thông tin về cách bạn sử dụng trang web, chẳng hạn như những trang bạn truy cập và liệu bạn gặp phải bất kỳ lỗi nào. Những cookie này không thu thập thông tin nhận dạng bạn. Tất cả thông tin mà những cookie này thu thập được tổng hợp và do đó là ẩn danh. Chúng chỉ được sử dụng để cải thiện cách trang web hoạt động.
                </p>
                <p>
                  Ví dụ về cookie hiệu suất mà chúng tôi sử dụng:
                </p>
                <ul>
                  <li><strong>_ga, _gid</strong>: Được sử dụng bởi Google Analytics để phân biệt người dùng và theo dõi lượt xem trang.</li>
                  <li><strong>_hjIncludedInSample</strong>: Được sử dụng bởi Hotjar để phân tích cách bạn sử dụng trang web.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.3. Cookie chức năng</h3>
                <p>
                  Cookie chức năng cho phép trang web ghi nhớ các lựa chọn bạn đã thực hiện (chẳng hạn như tên người dùng, ngôn ngữ hoặc khu vực bạn đang ở) và cung cấp các tính năng nâng cao, cá nhân hóa hơn. Những cookie này có thể được thiết lập bởi chúng tôi hoặc bởi các nhà cung cấp bên thứ ba có dịch vụ chúng tôi đã thêm vào trang web của mình.
                </p>
                <p>
                  Ví dụ về cookie chức năng mà chúng tôi sử dụng:
                </p>
                <ul>
                  <li><strong>language</strong>: Được sử dụng để ghi nhớ ngôn ngữ ưa thích của bạn.</li>
                  <li><strong>theme</strong>: Được sử dụng để ghi nhớ tùy chọn chủ đề của bạn (ví dụ: chế độ tối hoặc sáng).</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.4. Cookie tiếp thị</h3>
                <p>
                  Cookie tiếp thị được sử dụng để theo dõi người dùng trên các trang web. Mục đích là hiển thị quảng cáo phù hợp và hấp dẫn đối với từng người dùng, do đó có giá trị hơn đối với các nhà xuất bản và nhà quảng cáo bên thứ ba.
                </p>
                <p>
                  Ví dụ về cookie tiếp thị mà chúng tôi sử dụng:
                </p>
                <ul>
                  <li><strong>_fbp</strong>: Được sử dụng bởi Facebook để cung cấp một loạt sản phẩm quảng cáo.</li>
                  <li><strong>ads/ga-audiences</strong>: Được sử dụng bởi Google AdWords để tái tương tác với người dùng có khả năng chuyển đổi dựa trên hành vi trực tuyến của người dùng trên các trang web.</li>
                </ul>
              </div>
            </div>

            <div id="section-4" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaUserShield />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">4. Quản lý cookie</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Bạn có thể kiểm soát và quản lý cookie theo nhiều cách khác nhau. Xin lưu ý rằng việc xóa hoặc chặn cookie có thể ảnh hưởng đến trải nghiệm người dùng của bạn, và một số phần của trang web của chúng tôi có thể không còn hoạt động đầy đủ.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">4.1. Thông qua trình duyệt của bạn</h3>
                <p>
                  Hầu hết các trình duyệt web cho phép bạn kiểm soát cookie thông qua cài đặt của trình duyệt. Để tìm hiểu thêm về cách quản lý cookie trên các trình duyệt phổ biến:
                </p>
                <ul>
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">Microsoft Edge</a></li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">4.2. Thông qua cài đặt của chúng tôi</h3>
                <p>
                  Khi bạn truy cập trang web của chúng tôi lần đầu tiên, bạn sẽ thấy một banner cookie cho phép bạn chấp nhận hoặc từ chối các loại cookie khác nhau mà chúng tôi sử dụng. Bạn có thể thay đổi tùy chọn của mình bất kỳ lúc nào bằng cách truy cập trang "Cài đặt cookie" trên trang web của chúng tôi.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">4.3. Thông qua các công cụ bên thứ ba</h3>
                <p>
                  Bạn cũng có thể quản lý cookie của bên thứ ba thông qua các công cụ như:
                </p>
                <ul>
                  <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">Your Online Choices</a></li>
                  <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">Network Advertising Initiative</a></li>
                  <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">Digital Advertising Alliance</a></li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">4.4. Không theo dõi</h3>
                <p>
                  Một số trình duyệt có tính năng "Không theo dõi" (Do Not Track - DNT) cho phép bạn cho các trang web biết rằng bạn không muốn hoạt động trực tuyến của mình bị theo dõi. Hiện tại, không có tiêu chuẩn công nghệ thống nhất nào cho việc nhận biết và thực hiện tín hiệu DNT. Do đó, chúng tôi hiện không phản hồi tín hiệu DNT của trình duyệt.
                </p>
              </div>
            </div>

            <div id="section-5" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaGlobe />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">5. Cookie của bên thứ ba</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Trang web của chúng tôi có thể bao gồm các tính năng và chức năng được cung cấp bởi các bên thứ ba, chẳng hạn như nút "Thích" hoặc "Chia sẻ" của mạng xã hội, hoặc video nhúng. Những tính năng này có thể thu thập thông tin về bạn, chẳng hạn như địa chỉ IP của bạn và trang bạn đang truy cập, và có thể thiết lập cookie để cho phép tính năng hoạt động đúng cách.
                </p>
                <p>
                  Các tính năng và tiện ích của bên thứ ba được lưu trữ bởi bên thứ ba hoặc được lưu trữ trực tiếp trên trang web của chúng tôi. Việc bạn tương tác với các tính năng này được điều chỉnh bởi chính sách bảo mật của công ty cung cấp chúng.
                </p>
                <p>
                  Chúng tôi khuyến khích bạn xem xét chính sách bảo mật và cookie của các bên thứ ba này trước khi sử dụng các tính năng liên quan.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.1. Dịch vụ phân tích</h3>
                <p>
                  Chúng tôi sử dụng các dịch vụ phân tích của bên thứ ba như Google Analytics để thu thập thông tin về cách bạn sử dụng trang web của chúng tôi. Những dịch vụ này có thể sử dụng cookie và các công nghệ tương tự để thu thập và phân tích thông tin về việc sử dụng trang web của bạn. Thông tin được thu thập bởi các dịch vụ này được sử dụng để đánh giá việc sử dụng trang web của chúng tôi và biên soạn báo cáo về hoạt động của trang web.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.2. Mạng xã hội</h3>
                <p>
                  Trang web của chúng tôi có thể bao gồm các plugin và tiện ích của mạng xã hội như Facebook, Twitter, và Instagram. Những tính năng này có thể thu thập địa chỉ IP của bạn, trang bạn đang truy cập trên trang web của chúng tôi, và có thể thiết lập cookie để cho phép tính năng hoạt động đúng cách.
                </p>
                <p>
                  Việc bạn tương tác với những tính năng này được điều chỉnh bởi chính sách bảo mật của công ty cung cấp chúng.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.3. Quảng cáo</h3>
                <p>
                  Chúng tôi có thể sử dụng các mạng quảng cáo của bên thứ ba để hiển thị quảng cáo cho bạn khi bạn truy cập trang web của chúng tôi. Những mạng này có thể sử dụng cookie và các công nghệ tương tự để thu thập thông tin về hoạt động của bạn trên trang web của chúng tôi và các trang web khác để cung cấp quảng cáo dựa trên sở thích của bạn.
                </p>
              </div>
            </div>

            <div id="section-6" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaExclamationTriangle />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">6. Thay đổi chính sách</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi có thể cập nhật Chính sách cookie này theo thời gian để phản ánh những thay đổi trong thực tiễn sử dụng cookie của chúng tôi hoặc vì các lý do hoạt động, pháp lý hoặc quy định khác. Chúng tôi khuyến khích bạn xem xét Chính sách cookie này thường xuyên để biết thông tin mới nhất về việc sử dụng cookie của chúng tôi.
                </p>
                <p>
                  Ngày "Cập nhật lần cuối" ở đầu Chính sách cookie này cho biết khi nào chính sách này được sửa đổi lần cuối. Bằng cách tiếp tục sử dụng trang web của chúng tôi sau khi những thay đổi đó có hiệu lực, bạn đồng ý bị ràng buộc bởi Chính sách cookie đã sửa đổi.
                </p>
              </div>
            </div>

            <div id="section-7" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaGlobe />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">7. Liên hệ</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Nếu bạn có bất kỳ câu hỏi, lo ngại, hoặc yêu cầu nào về Chính sách cookie này hoặc cách chúng tôi sử dụng cookie, vui lòng liên hệ với chúng tôi:
                </p>
                <ul>
                  <li>Email: privacy@bobace.com</li>
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
                Bạn có câu hỏi về cookie?
              </h2>
              <p className="text-xl text-white/90 mb-6">
                Đội ngũ bảo mật của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn
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

export default CookiePolicy;