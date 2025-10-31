import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

const ReportUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [reportType, setReportType] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [evidencePreview, setEvidencePreview] = useState([]);
  
  const reportTypes = [
    { value: 'inappropriate_content', label: 'Nội dung không phù hợp' },
    { value: 'harassment', label: 'Quấy rối' },
    { value: 'fake_profile', label: 'Tài khoản giả mạo' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Khác' }
  ];
  
  const reportReasons = {
    inappropriate_content: [
      'Hình ảnh không phù hợp',
      'Ngôn ngữ xúc phạm',
      'Nội dung người lớn',
      'Nội dung bạo lực',
      'Khác'
    ],
    harassment: [
      'Tin nhắn quấy rối',
      'Đe dọa',
      'Bắt nạt',
      'Theo dõi',
      'Khác'
    ],
    fake_profile: [
      'Sử dụng hình ảnh của người khác',
      'Thông tin giả mạo',
      'Mạo danh người nổi tiếng',
      'Khác'
    ],
    spam: [
      'Tin nhắn quảng cáo',
      'Liên kết đáng ngờ',
      'Lặp lại nội dung',
      'Khác'
    ],
    other: [
      'Vi phạm điều khoản dịch vụ',
      'Hành vi đáng ngờ',
      'Khác'
    ]
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Vui lòng đăng nhập để tiếp tục');
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, navigate]);
  
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setReportReason('');
  };
  
  const handleEvidenceChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.warning('Bạn chỉ có thể tải lên tối đa 5 hình ảnh');
      return;
    }
    
    // Tạo preview cho hình ảnh
    const newEvidencePreview = files.map(file => URL.createObjectURL(file));
    setEvidencePreview(newEvidencePreview);
    setEvidence(files);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType) {
      toast.warning('Vui lòng chọn loại báo cáo');
      return;
    }
    
    if (!reportReason) {
      toast.warning('Vui lòng chọn lý do báo cáo');
      return;
    }
    
    if (!description || description.length < 10) {
      toast.warning('Vui lòng nhập mô tả chi tiết (ít nhất 10 ký tự)');
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Convert evidence files to base64
      let evidenceBase64 = [];
      if (evidence.length > 0) {
        console.log(`Converting ${evidence.length} evidence files to base64`);
        const base64Promises = evidence.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        evidenceBase64 = await Promise.all(base64Promises);
      }
      
      // Prepare request data with base64 evidence
      const requestData = {
        reportedUserId: userId,
        type: reportType,
        reason: reportReason,
        description: description,
        evidence: evidenceBase64
      };
      
      console.log('Submitting report with base64 evidence');
      const response = await axios.post(`${API_URL}/api/reports`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Report submission response:', response.data);
      
      toast.success('Báo cáo đã được gửi thành công');
      navigate(-1);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Không thể gửi báo cáo. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <FaArrowLeft className="text-amber-600" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-800">Báo cáo người dùng</h1>
        </div>
        
        {user && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <img
                src={user.avatar || 'https://via.placeholder.com/100'}
                alt={user.fullName}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold text-neutral-800">{user.fullName}</h2>
                <p className="text-neutral-500">{user.email}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-neutral-700 font-medium">Lưu ý quan trọng:</p>
                  <p className="text-neutral-600 text-sm mt-1">
                    Báo cáo sẽ được gửi đến đội ngũ quản trị viên để xem xét. Vui lòng chỉ báo cáo khi bạn thực sự gặp vấn đề với người dùng này. Việc lạm dụng tính năng báo cáo có thể dẫn đến hạn chế tài khoản của bạn.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-neutral-700 font-medium mb-2">
                  Loại báo cáo
                </label>
                <select
                  value={reportType}
                  onChange={handleReportTypeChange}
                  className="w-full border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Chọn loại báo cáo --</option>
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {reportType && (
                <div className="mb-4">
                  <label className="block text-neutral-700 font-medium mb-2">
                    Lý do báo cáo
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn lý do --</option>
                    {reportReasons[reportType].map(reason => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-neutral-700 font-medium mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[120px]"
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải với người dùng này..."
                  required
                  minLength={10}
                />
                <p className="text-neutral-500 text-sm mt-1">
                  Tối thiểu 10 ký tự, tối đa 500 ký tự
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-neutral-700 font-medium mb-2">
                  Bằng chứng (tùy chọn)
                </label>
                <input
                  type="file"
                  onChange={handleEvidenceChange}
                  className="hidden"
                  id="evidence-upload"
                  multiple
                  accept="image/*"
                />
                <label
                  htmlFor="evidence-upload"
                  className="block w-full border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-amber-500 transition-colors"
                >
                  <p className="text-neutral-600">Nhấp để tải lên hình ảnh</p>
                  <p className="text-neutral-500 text-sm mt-1">
                    Tối đa 5 hình ảnh, mỗi hình không quá 5MB
                  </p>
                </label>
                
                {evidencePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {evidencePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPreview = [...evidencePreview];
                            newPreview.splice(index, 1);
                            setEvidencePreview(newPreview);
                            
                            const newEvidence = [...evidence];
                            newEvidence.splice(index, 1);
                            setEvidence(newEvidence);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 mr-4 bg-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="mr-2">Đang gửi...</span>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    'Gửi báo cáo'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportUser;