import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import logo from '../images/logo2.png';

const Footer = () => {
  return (
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
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <FaFacebookF className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <FaTwitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-800 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} BOBACE. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;