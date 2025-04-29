import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaChrome, FaFirefox, FaEdge, FaSafari } from 'react-icons/fa';

const NotificationGuide = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [browser, setBrowser] = useState('Unknown');
  const [browserIcon, setBrowserIcon] = useState(null);
  
  // Xác định trình duyệt người dùng
  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      
      if (userAgent.indexOf("Edg") > -1) {
        setBrowser("Edge");
        setBrowserIcon(<FaEdge />);
      } else if (userAgent.indexOf("Chrome") > -1) {
        setBrowser("Chrome");
        setBrowserIcon(<FaChrome />);
      } else if (userAgent.indexOf("Firefox") > -1) {
        setBrowser("Firefox");
        setBrowserIcon(<FaFirefox />);
      } else if (userAgent.indexOf("Safari") > -1) {
        setBrowser("Safari");
        setBrowserIcon(<FaSafari />);
      } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
        setBrowser("Internet Explorer");
        setBrowserIcon(<FaBell />);
      } else {
        setBrowser("Unknown");
        setBrowserIcon(<FaBell />);
      }
    };
    
    detectBrowser();
  }, []);
  
  // Hướng dẫn theo từng trình duyệt
  const getInstructions = () => {
    switch (browser) {
      case "Chrome":
        return [
          {
            title: "Bước 1: Mở cài đặt trình duyệt",
            content: "Nhấp vào biểu tượng ba chấm ⋮ ở góc trên bên phải trình duyệt, sau đó chọn 'Cài đặt'.",
            image: "https://i.imgur.com/8YMcXAl.png"
          },
          {
            title: "Bước 2: Truy cập cài đặt quyền",
            content: "Cuộn xuống và nhấp vào 'Quyền riêng tư và bảo mật', sau đó chọn 'Cài đặt trang web'.",
            image: "https://i.imgur.com/JQIgUZl.png"
          },
          {
            title: "Bước 3: Tìm cài đặt thông báo",
            content: "Tìm và nhấp vào 'Thông báo' trong danh sách quyền.",
            image: "https://i.imgur.com/Xp7Xmyv.png"
          },
          {
            title: "Bước 4: Cho phép thông báo",
            content: "Tìm trang web của chúng tôi trong danh sách và chọn 'Cho phép'. Nếu không thấy trang web, bạn có thể thêm mới bằng cách nhấp vào 'Thêm'.",
            image: "https://i.imgur.com/Yl8YbTB.png"
          },
          {
            title: "Bước 5: Làm mới trang",
            content: "Sau khi cấp quyền, hãy quay lại trang web của chúng tôi và làm mới trang (F5) để thay đổi có hiệu lực."
          }
        ];
      case "Firefox":
        return [
          {
            title: "Bước 1: Mở cài đặt trình duyệt",
            content: "Nhấp vào biểu tượng ba gạch ngang ☰ ở góc trên bên phải, sau đó chọn 'Tùy chọn'.",
            image: "https://i.imgur.com/Yd5Yvci.png"
          },
          {
            title: "Bước 2: Truy cập cài đặt quyền",
            content: "Chọn 'Quyền riêng tư & Bảo mật' ở thanh bên trái.",
            image: "https://i.imgur.com/JHD0kKA.png"
          },
          {
            title: "Bước 3: Tìm cài đặt thông báo",
            content: "Cuộn xuống phần 'Quyền' và tìm 'Thông báo'.",
            image: "https://i.imgur.com/Yd5Yvci.png"
          },
          {
            title: "Bước 4: Cho phép thông báo",
            content: "Nhấp vào 'Cài đặt' bên cạnh Thông báo, tìm trang web của chúng tôi và chọn 'Cho phép'.",
            image: "https://i.imgur.com/Yd5Yvci.png"
          },
          {
            title: "Bước 5: Làm mới trang",
            content: "Sau khi cấp quyền, hãy quay lại trang web của chúng tôi và làm mới trang (F5) để thay đổi có hiệu lực."
          }
        ];
      case "Safari":
        return [
          {
            title: "Bước 1: Mở tùy chọn Safari",
            content: "Nhấp vào 'Safari' ở góc trên bên trái màn hình, sau đó chọn 'Tùy chọn'."
          },
          {
            title: "Bước 2: Truy cập cài đặt trang web",
            content: "Chọn tab 'Trang web' ở trên cùng."
          },
          {
            title: "Bước 3: Tìm cài đặt thông báo",
            content: "Tìm 'Thông báo' trong danh sách bên trái."
          },
          {
            title: "Bước 4: Cho phép thông báo",
            content: "Tìm trang web của chúng tôi trong danh sách bên phải và chọn 'Cho phép'."
          }
        ];
      case "Edge":
        return [
          {
            title: "Bước 1: Mở cài đặt trình duyệt",
            content: "Nhấp vào biểu tượng ba chấm ⋯ ở góc trên bên phải, sau đó chọn 'Cài đặt'.",
            image: "https://i.imgur.com/8YMcXAl.png"
          },
          {
            title: "Bước 2: Truy cập cài đặt cookie và quyền trang web",
            content: "Chọn 'Cookie và quyền trang web' ở thanh bên trái.",
            image: "https://i.imgur.com/JQIgUZl.png"
          },
          {
            title: "Bước 3: Tìm cài đặt thông báo",
            content: "Tìm và nhấp vào 'Thông báo'.",
            image: "https://i.imgur.com/Xp7Xmyv.png"
          },
          {
            title: "Bước 4: Cho phép thông báo",
            content: "Tìm trang web của chúng tôi trong danh sách và chọn 'Cho phép'. Nếu không thấy trang web, bạn có thể thêm mới bằng cách nhấp vào 'Thêm'.",
            image: "https://i.imgur.com/Yl8YbTB.png"
          },
          {
            title: "Bước 5: Làm mới trang",
            content: "Sau khi cấp quyền, hãy quay lại trang web của chúng tôi và làm mới trang (F5) để thay đổi có hiệu lực."
          }
        ];
      default:
        return [
          {
            title: "Bước 1: Mở cài đặt trình duyệt",
            content: "Mở menu cài đặt của trình duyệt của bạn. Thường nằm ở góc trên bên phải của trình duyệt."
          },
          {
            title: "Bước 2: Tìm cài đặt quyền hoặc thông báo",
            content: "Tìm phần cài đặt liên quan đến quyền trang web, bảo mật, hoặc thông báo. Thường nằm trong mục Quyền riêng tư hoặc Bảo mật."
          },
          {
            title: "Bước 3: Tìm cài đặt thông báo",
            content: "Trong phần cài đặt quyền, tìm mục 'Thông báo' hoặc 'Notifications'."
          },
          {
            title: "Bước 4: Tìm trang web của chúng tôi",
            content: "Tìm trang web của chúng tôi trong danh sách các trang web. Nếu không thấy, bạn có thể cần phải thêm trang web vào danh sách."
          },
          {
            title: "Bước 5: Cho phép thông báo",
            content: "Thay đổi cài đặt để cho phép thông báo từ trang web của chúng tôi."
          },
          {
            title: "Bước 6: Làm mới trang",
            content: "Sau khi cấp quyền, hãy quay lại trang web của chúng tôi và làm mới trang (F5) để thay đổi có hiệu lực."
          }
        ];
    }
  };
  
  const instructions = getInstructions();
  
  const nextStep = () => {
    if (step < instructions.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            {browserIcon || <FaBell className="mr-2 text-yellow-500" />}
            <span className="ml-2">Hướng dẫn bật thông báo cho {browser}</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{instructions[step-1].title}</h3>
            <p className="text-gray-600">{instructions[step-1].content}</p>
            
            {/* Hiển thị hình ảnh minh họa nếu có */}
            {instructions[step-1].image && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <img 
                  src={instructions[step-1].image} 
                  alt={`Bước ${step}`} 
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-4 py-2 rounded ${step === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Quay lại
            </button>
            
            <div className="text-sm text-gray-500">
              Bước {step}/{instructions.length}
            </div>
            
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              {step === instructions.length ? 'Hoàn tất' : 'Tiếp theo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationGuide;