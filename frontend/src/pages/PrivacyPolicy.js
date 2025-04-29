import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaUserShield, FaDatabase, FaGlobe, FaLock, FaUserFriends, FaExclamationTriangle, FaChild } from 'react-icons/fa';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
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
                <FaShieldAlt />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                Chính sách bảo mật
              </h1>
            </div>
            
            <div className="bg-yellow-100/50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-neutral-700">
                <strong>Cập nhật lần cuối:</strong> Ngày 15 tháng 3 năm 2024
              </p>
            </div>
            
            <p className="text-lg text-neutral-700 mb-8 leading-relaxed">
              Chính sách bảo mật này mô tả cách BOBACE thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn khi bạn sử dụng nền tảng của chúng tôi. Chúng tôi coi trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân của bạn.
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
                  1. Thông tin chúng tôi thu thập
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-2')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  2. Cách chúng tôi sử dụng thông tin
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-3')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  3. Chia sẻ thông tin
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-4')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  4. Bảo mật dữ liệu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-5')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  5. Quyền của bạn
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-6')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  6. Dữ liệu trẻ em
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-7')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  7. Thay đổi chính sách
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-8')}
                  className="text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none"
                >
                  8. Liên hệ
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg prose-yellow">
            <div id="section-1" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaUserShield />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">1. Thông tin chúng tôi thu thập</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi thu thập nhiều loại thông tin khác nhau từ và về người dùng của chúng tôi, bao gồm:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">1.1. Thông tin cá nhân</h3>
                <p>
                  Khi bạn đăng ký và sử dụng BOBACE, chúng tôi có thể thu thập các thông tin cá nhân sau:
                </p>
                <ul>
                  <li>Thông tin nhận dạng: họ tên, ngày sinh, giới tính, địa chỉ email, số điện thoại.</li>
                  <li>Hình ảnh: ảnh đại diện và các hình ảnh khác mà bạn tải lên hồ sơ của mình.</li>
                  <li>Thông tin hồ sơ: sở thích về trà sữa, loại trà sữa yêu thích, quán trà sữa yêu thích, và các thông tin khác mà bạn chọn chia sẻ trong hồ sơ của mình.</li>
                  <li>Thông tin xác thực: thông tin đăng nhập, mật khẩu (được lưu trữ dưới dạng mã hóa).</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">1.2. Thông tin sử dụng</h3>
                <p>
                  Chúng tôi tự động thu thập thông tin về cách bạn tương tác với nền tảng của chúng tôi, bao gồm:
                </p>
                <ul>
                  <li>Dữ liệu hoạt động: thông tin về cách bạn sử dụng nền tảng, như các hồ sơ bạn xem, người dùng bạn thích, tin nhắn bạn gửi.</li>
                  <li>Dữ liệu thiết bị: loại thiết bị, hệ điều hành, phiên bản trình duyệt, cài đặt ngôn ngữ, múi giờ, và thông tin về kết nối mạng.</li>
                  <li>Dữ liệu vị trí: với sự đồng ý của bạn, chúng tôi có thể thu thập thông tin về vị trí chính xác hoặc gần đúng của bạn thông qua GPS, Bluetooth, hoặc Wi-Fi.</li>
                  <li>Dữ liệu nhật ký: địa chỉ IP, thời gian truy cập, trang đã xem, và các thông tin khác về cách bạn tương tác với nền tảng của chúng tôi.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">1.3. Thông tin từ bên thứ ba</h3>
                <p>
                  Chúng tôi có thể nhận thông tin về bạn từ các nguồn bên thứ ba, bao gồm:
                </p>
                <ul>
                  <li>Đối tác kinh doanh: chúng tôi có thể nhận thông tin về bạn từ các đối tác kinh doanh của chúng tôi.</li>
                  <li>Mạng xã hội: nếu bạn chọn đăng nhập hoặc kết nối tài khoản của mình với các dịch vụ mạng xã hội, chúng tôi có thể thu thập thông tin từ các dịch vụ đó.</li>
                </ul>
              </div>
            </div>

            <div id="section-2" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaDatabase />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">2. Cách chúng tôi sử dụng thông tin</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi sử dụng thông tin chúng tôi thu thập cho các mục đích sau:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.1. Cung cấp và cải thiện dịch vụ</h3>
                <ul>
                  <li>Tạo và quản lý tài khoản của bạn.</li>
                  <li>Cung cấp các tính năng và dịch vụ bạn yêu cầu.</li>
                  <li>Cá nhân hóa trải nghiệm của bạn trên nền tảng.</li>
                  <li>Đề xuất các kết nối và nội dung phù hợp với sở thích của bạn.</li>
                  <li>Phát triển và cải thiện nền tảng, bao gồm thêm tính năng mới và tăng cường bảo mật.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.2. Liên lạc với bạn</h3>
                <ul>
                  <li>Gửi thông báo về các cập nhật, tính năng mới, hoặc thay đổi đối với dịch vụ của chúng tôi.</li>
                  <li>Phản hồi các yêu cầu, câu hỏi, và phản hồi của bạn.</li>
                  <li>Gửi thông tin về các sự kiện, khuyến mãi, hoặc tin tức liên quan đến BOBACE.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.3. Bảo mật và an toàn</h3>
                <ul>
                  <li>Xác minh danh tính của bạn và ngăn chặn gian lận hoặc hoạt động trái phép.</li>
                  <li>Giám sát và phân tích các mẫu sử dụng và hoạt động để phát hiện và ngăn chặn hành vi lạm dụng hoặc vi phạm.</li>
                  <li>Bảo vệ quyền, tài sản, hoặc sự an toàn của BOBACE, người dùng của chúng tôi, hoặc công chúng.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">2.4. Nghiên cứu và phân tích</h3>
                <ul>
                  <li>Hiểu cách người dùng tương tác với nền tảng của chúng tôi.</li>
                  <li>Phân tích xu hướng và hành vi người dùng để cải thiện dịch vụ của chúng tôi.</li>
                  <li>Tiến hành khảo sát và nghiên cứu để đánh giá và nâng cao trải nghiệm người dùng.</li>
                </ul>
              </div>
            </div>

            <div id="section-3" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaUserFriends />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">3. Chia sẻ thông tin</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp sau:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.1. Với người dùng khác</h3>
                <p>
                  Khi bạn sử dụng BOBACE, một số thông tin cá nhân của bạn sẽ được hiển thị cho người dùng khác, bao gồm:
                </p>
                <ul>
                  <li>Thông tin hồ sơ công khai: tên, tuổi, ảnh đại diện, sở thích về trà sữa, và các thông tin khác mà bạn chọn chia sẻ trong hồ sơ công khai của mình.</li>
                  <li>Nội dung bạn đăng: tin nhắn, bình luận, hoặc nội dung khác mà bạn đăng trên nền tảng sẽ được hiển thị cho những người dùng mà bạn tương tác.</li>
                </ul>
                <p>
                  Bạn có thể kiểm soát một số thông tin được hiển thị cho người dùng khác thông qua cài đặt quyền riêng tư của mình.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.2. Với nhà cung cấp dịch vụ</h3>
                <p>
                  Chúng tôi có thể chia sẻ thông tin của bạn với các nhà cung cấp dịch vụ bên thứ ba để hỗ trợ chúng tôi trong việc cung cấp và cải thiện dịch vụ của mình, bao gồm:
                </p>
                <ul>
                  <li>Nhà cung cấp dịch vụ lưu trữ và đám mây.</li>
                  <li>Nhà cung cấp dịch vụ phân tích và xử lý dữ liệu.</li>
                  <li>Nhà cung cấp dịch vụ thanh toán và xử lý giao dịch.</li>
                  <li>Nhà cung cấp dịch vụ hỗ trợ khách hàng.</li>
                </ul>
                <p>
                  Các nhà cung cấp dịch vụ này chỉ có quyền truy cập vào thông tin cần thiết để thực hiện các dịch vụ của họ và phải bảo vệ thông tin của bạn theo các tiêu chuẩn tương tự như chúng tôi.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.3. Vì lý do pháp lý</h3>
                <p>
                  Chúng tôi có thể chia sẻ thông tin của bạn nếu chúng tôi tin rằng việc tiết lộ là cần thiết để:
                </p>
                <ul>
                  <li>Tuân thủ luật pháp, quy định, quy trình pháp lý, hoặc yêu cầu của chính phủ.</li>
                  <li>Thực thi các điều khoản dịch vụ của chúng tôi hoặc các chính sách khác.</li>
                  <li>Bảo vệ quyền, tài sản, hoặc sự an toàn của BOBACE, người dùng của chúng tôi, hoặc công chúng.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.4. Trong trường hợp chuyển nhượng kinh doanh</h3>
                <p>
                  Nếu BOBACE tham gia vào một vụ sáp nhập, mua lại, hoặc bán tài sản, thông tin của bạn có thể được chuyển giao như một phần của giao dịch đó. Chúng tôi sẽ thông báo cho bạn trước khi thông tin của bạn được chuyển giao và trở thành đối tượng của một chính sách bảo mật khác.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">3.5. Với sự đồng ý của bạn</h3>
                <p>
                  Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp khác với sự đồng ý rõ ràng của bạn.
                </p>
              </div>
            </div>

            <div id="section-4" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaLock />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">4. Bảo mật dữ liệu</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi coi trọng việc bảo vệ thông tin của bạn và đã triển khai các biện pháp bảo mật thích hợp để bảo vệ thông tin đó khỏi mất mát, lạm dụng, và truy cập, tiết lộ, thay đổi, hoặc phá hủy trái phép.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">4.1. Biện pháp bảo mật</h3>
                <p>
                  Các biện pháp bảo mật của chúng tôi bao gồm:
                </p>
                <ul>
                  <li>Mã hóa dữ liệu: chúng tôi sử dụng công nghệ mã hóa tiêu chuẩn ngành để bảo vệ dữ liệu nhạy cảm, như mật khẩu và thông tin thanh toán.</li>
                  <li>Kiểm soát truy cập: chúng tôi hạn chế quyền truy cập vào thông tin cá nhân chỉ cho nhân viên, nhà thầu, và đại lý có nhu cầu kinh doanh cần biết thông tin đó.</li>
                  <li>Giám sát bảo mật: chúng tôi thường xuyên kiểm tra hệ thống của mình để phát hiện các lỗ hổng bảo mật và các mối đe dọa tiềm ẩn.</li>
                  <li>Đào tạo nhân viên: chúng tôi đào tạo nhân viên về tầm quan trọng của bảo mật thông tin và các thực hành tốt nhất để bảo vệ dữ liệu người dùng.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">4.2. Lưu trữ dữ liệu</h3>
                <p>
                  Chúng tôi lưu trữ thông tin của bạn miễn là cần thiết để cung cấp dịch vụ của chúng tôi hoặc theo yêu cầu của pháp luật. Thời gian lưu trữ cụ thể phụ thuộc vào loại thông tin, mục đích sử dụng, và các yêu cầu pháp lý.
                </p>
                <p>
                  Khi thông tin của bạn không còn cần thiết cho các mục đích mà chúng tôi thu thập, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin đó, trừ khi chúng tôi có nghĩa vụ pháp lý phải giữ lại thông tin đó.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">4.3. Vi phạm dữ liệu</h3>
                <p>
                  Trong trường hợp xảy ra vi phạm dữ liệu ảnh hưởng đến thông tin cá nhân của bạn, chúng tôi sẽ thông báo cho bạn và các cơ quan quản lý liên quan theo yêu cầu của pháp luật. Chúng tôi sẽ cung cấp thông tin về bản chất của vi phạm, thông tin bị ảnh hưởng, và các biện pháp chúng tôi đang thực hiện để khắc phục tình hình.
                </p>
              </div>
            </div>

            <div id="section-5" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaUserShield />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">5. Quyền của bạn</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Tùy thuộc vào luật pháp áp dụng, bạn có thể có các quyền sau đối với thông tin cá nhân của mình:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.1. Quyền truy cập</h3>
                <p>
                  Bạn có quyền yêu cầu bản sao thông tin cá nhân mà chúng tôi lưu giữ về bạn. Bạn có thể truy cập hầu hết thông tin cá nhân của mình thông qua cài đặt tài khoản của bạn.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.2. Quyền chỉnh sửa</h3>
                <p>
                  Bạn có quyền yêu cầu chúng tôi sửa thông tin cá nhân không chính xác hoặc không đầy đủ về bạn. Bạn có thể cập nhật hầu hết thông tin cá nhân của mình thông qua cài đặt tài khoản của bạn.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.3. Quyền xóa</h3>
                <p>
                  Bạn có quyền yêu cầu chúng tôi xóa thông tin cá nhân của bạn trong một số trường hợp nhất định, chẳng hạn như khi thông tin không còn cần thiết cho các mục đích mà chúng tôi thu thập. Bạn có thể xóa tài khoản của mình thông qua cài đặt tài khoản.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.4. Quyền hạn chế xử lý</h3>
                <p>
                  Bạn có quyền yêu cầu chúng tôi hạn chế việc xử lý thông tin cá nhân của bạn trong một số trường hợp nhất định, chẳng hạn như khi bạn cho rằng thông tin chúng tôi lưu giữ về bạn là không chính xác.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.5. Quyền phản đối</h3>
                <p>
                  Bạn có quyền phản đối việc chúng tôi xử lý thông tin cá nhân của bạn trong một số trường hợp nhất định, chẳng hạn như khi chúng tôi xử lý thông tin của bạn cho mục đích tiếp thị trực tiếp.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.6. Quyền di chuyển dữ liệu</h3>
                <p>
                  Bạn có quyền yêu cầu chúng tôi cung cấp thông tin cá nhân của bạn ở định dạng có cấu trúc, thường được sử dụng và có thể đọc được bằng máy, và để chuyển thông tin đó sang một tổ chức khác trong một số trường hợp nhất định.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 text-neutral-800">5.7. Thực hiện quyền của bạn</h3>
                <p>
                  Để thực hiện bất kỳ quyền nào của bạn, vui lòng liên hệ với chúng tôi theo thông tin liên hệ được cung cấp ở cuối chính sách này. Chúng tôi sẽ phản hồi yêu cầu của bạn trong thời gian hợp lý và phù hợp với luật pháp áp dụng.
                </p>
                <p>
                  Xin lưu ý rằng chúng tôi có thể yêu cầu thông tin cụ thể từ bạn để giúp chúng tôi xác nhận danh tính của bạn và đảm bảo quyền của bạn để truy cập thông tin cá nhân của mình. Đây là biện pháp bảo mật để đảm bảo rằng thông tin cá nhân không bị tiết lộ cho bất kỳ người nào không có quyền nhận thông tin đó.
                </p>
              </div>
            </div>

            <div id="section-6" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaChild />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">6. Dữ liệu trẻ em</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Dịch vụ của chúng tôi không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 18 tuổi. Nếu bạn là phụ huynh hoặc người giám hộ và bạn biết rằng con bạn đã cung cấp thông tin cá nhân cho chúng tôi, vui lòng liên hệ với chúng tôi. Nếu chúng tôi phát hiện ra rằng chúng tôi đã vô tình thu thập thông tin cá nhân từ trẻ em dưới 18 tuổi mà không có sự đồng ý của phụ huynh, chúng tôi sẽ thực hiện các bước để xóa thông tin đó khỏi máy chủ của chúng tôi.
                </p>
              </div>
            </div>

            <div id="section-7" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaExclamationTriangle />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">7. Thay đổi chính sách</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian để phản ánh những thay đổi trong thực tiễn thông tin của chúng tôi. Nếu chúng tôi thực hiện những thay đổi quan trọng, chúng tôi sẽ thông báo cho bạn bằng cách đăng thông báo về những thay đổi đó trên trang web của chúng tôi hoặc bằng cách gửi thông báo trực tiếp cho bạn. Chúng tôi khuyến khích bạn xem xét Chính sách bảo mật này định kỳ để biết thông tin mới nhất về cách chúng tôi bảo vệ thông tin của bạn.
                </p>
                <p>
                  Ngày "Cập nhật lần cuối" ở đầu Chính sách bảo mật này cho biết khi nào chính sách này được sửa đổi lần cuối. Bằng cách tiếp tục sử dụng Dịch vụ của chúng tôi sau khi những thay đổi đó có hiệu lực, bạn đồng ý bị ràng buộc bởi Chính sách bảo mật đã sửa đổi.
                </p>
              </div>
            </div>

            <div id="section-8" className="mb-12 scroll-mt-24">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-xl mr-3 flex-shrink-0">
                  <FaGlobe />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">8. Liên hệ</h2>
              </div>
              
              <div className="pl-0 md:pl-14">
                <p>
                  Nếu bạn có bất kỳ câu hỏi, lo ngại, hoặc yêu cầu nào về Chính sách bảo mật này hoặc cách chúng tôi xử lý thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi:
                </p>
                <ul>
                  <li>Email: privacy@bobace.com</li>
                  <li>Địa chỉ: Quận 7, TP.HCM</li>
                  <li>Điện thoại: +84 33 533 7843</li>
                </ul>
                <p>
                  Chúng tôi sẽ cố gắng giải quyết bất kỳ khiếu nại hoặc lo ngại nào mà bạn có thể có về việc sử dụng thông tin cá nhân của bạn theo Chính sách bảo mật này.
                </p>
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
                Bạn có câu hỏi về quyền riêng tư?
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

export default PrivacyPolicy;