import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';
import { fileToBase64, filesToBase64 } from '../utils/imageUtils';

const ImageUploader = ({ 
  onImageUploaded, 
  type = 'avatar', 
  currentImage = '', 
  maxImages = 6,
  currentImages = []
}) => {
  const { currentUser, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // For multiple images
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  // Tham chiếu để hủy request nếu cần
  const cancelTokenRef = useRef(null);
  
  // State để theo dõi trạng thái kéo thả
  const [isDragging, setIsDragging] = useState(false);
  
  // State cho thông báo tùy chỉnh
  const [customToastMessage, setCustomToastMessage] = useState('');
  const [showCustomToast, setShowCustomToast] = useState(false);
  
  // State để theo dõi ảnh đang được chọn để xóa hoặc thay đổi
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  
  // Xử lý khi bắt đầu kéo
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Xử lý khi người dùng nhấp vào ảnh
  const handleImageClick = (index, event) => {
    // Ngăn chặn sự kiện lan truyền để tránh xung đột với các sự kiện khác
    if (event) {
      event.stopPropagation();
    }
    
    // Đóng menu tùy chọn hiện tại nếu đang mở
    if (selectedImageIndex === index && showImageOptions) {
      setShowImageOptions(false);
    } else {
      setSelectedImageIndex(index);
      setShowImageOptions(true);
    }
  };
  
  // Chức năng thay đổi ảnh đã bị loại bỏ theo yêu cầu
  
  // Xử lý kéo thả để thay đổi vị trí ảnh
  const handleDragEnd = (result) => {
    // Đặt lại trạng thái kéo
    setIsDragging(false);
    
    // Nếu thả ra ngoài vùng cho phép
    if (!result.destination) {
      return;
    }
    
    // Lấy thông tin về nguồn và đích
    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    console.log('Drag info:', {
      sourceDroppableId,
      destinationDroppableId,
      sourceIndex,
      destinationIndex
    });
    
    // Tạo bản sao của mảng ảnh hiện tại
    const newImages = Array.from(currentImages);
    
    // Tính toán vị trí thực tế trong mảng dựa trên droppableId và index
    let realSourceIndex = sourceIndex;
    let realDestinationIndex = destinationIndex;
    
    // Nếu nguồn là từ hàng thứ hai (ảnh 4-6)
    if (sourceDroppableId === 'photo-gallery-row2') {
      realSourceIndex = sourceIndex + 3;
    }
    
    // Nếu đích là hàng thứ hai (ảnh 4-6)
    if (destinationDroppableId === 'photo-gallery-row2') {
      realDestinationIndex = destinationIndex + 3;
    }
    
    // Nếu kéo từ hàng 1 xuống hàng 2
    if (sourceDroppableId === 'photo-gallery-row1' && destinationDroppableId === 'photo-gallery-row2') {
      // Đảm bảo có đủ ảnh trong hàng 1 để kéo xuống
      if (currentImages.length <= 3) {
        toast.error('Không thể kéo ảnh từ hàng 1 xuống hàng 2 khi chưa đủ ảnh ở hàng 1');
        return;
      }
    }
    
    console.log('Real indices:', {
      realSourceIndex,
      realDestinationIndex
    });
    
    // Lấy ảnh được kéo
    const [movedImage] = newImages.splice(realSourceIndex, 1);
    
    // Chèn ảnh vào vị trí mới
    newImages.splice(realDestinationIndex, 0, movedImage);
    
    // Cập nhật lại mảng ảnh
    onImageUploaded(newImages);
    
    // Log thông tin để debug
    console.log('Drag completed:', {
      source: sourceIndex,
      destination: destinationIndex,
      imagesCount: newImages.length
    });
  };
  
  const handleFileChange = (e) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    // Kiểm tra định dạng file
    const validateFile = (file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error(`File "${file.name}" không đúng định dạng. Chỉ chấp nhận JPG, PNG và GIF.`);
        return false;
      }
      return true;
    };
    
    if (type === 'multiple') {
      // Check if adding new files would exceed the limit
      if (currentImages.length + files.length > maxImages) {
        toast.error(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh`);
        return;
      }
      
      const newFiles = Array.from(files).filter(validateFile);
      
      if (newFiles.length === 0) {
        return; // Không có file hợp lệ
      }
      
      setSelectedFiles(newFiles);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    } else {
      // Single file upload
      const file = files[0];
      
      if (!validateFile(file)) {
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    }
  };
  
  // Hàm nén ảnh trước khi tải lên
  const compressImage = async (imageFile) => {
    try {
      // Kiểm tra lại định dạng file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(imageFile.type)) {
        toast.error(`File không đúng định dạng. Chỉ chấp nhận JPG, PNG và GIF.`);
        throw new Error('Invalid file type');
      }
      
      // Nếu là GIF, không nén vì có thể làm mất animation
      if (imageFile.type === 'image/gif') {
        console.log('File GIF không được nén để giữ nguyên animation');
        return imageFile;
      }
      
      const options = {
        maxSizeMB: 0.3, // Giảm kích thước tối đa xuống 0.3MB
        maxWidthOrHeight: 800, // Giảm kích thước ảnh xuống nhiều hơn
        useWebWorker: true, // Sử dụng WebWorker để tránh block UI thread
        initialQuality: 0.6, // Giảm chất lượng xuống nhiều hơn
      };
      
      // Không hiển thị thông báo nén ảnh nữa
      
      // Nén ảnh
      const compressedFile = await imageCompression(imageFile, options);
      
      console.log('Tên file:', imageFile.name);
      console.log('Loại file:', imageFile.type);
      console.log('Kích thước ảnh gốc:', imageFile.size / 1024 / 1024, 'MB');
      console.log('Kích thước ảnh sau khi nén:', compressedFile.size / 1024 / 1024, 'MB');
      
      return compressedFile;
    } catch (error) {
      console.error('Lỗi khi nén ảnh:', error);
      
      // Nếu lỗi liên quan đến định dạng, ném lỗi để dừng quá trình tải lên
      if (error.message === 'Invalid file type') {
        throw error;
      }
      
      // Nếu có lỗi khác khi nén, trả về file gốc
      return imageFile;
    }
  };

  const uploadImage = async () => {
    if (!selectedFile && selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ảnh để tải lên');
      return;
    }
    
    // Hủy request trước đó nếu có
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Người dùng bắt đầu tải lên mới');
    }
    
    // Tạo cancel token mới
    cancelTokenRef.current = axios.CancelToken.source();
    
    setUploading(true);
    setProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Bạn cần đăng nhập để tải lên ảnh');
        setUploading(false);
        return;
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 120000, // Tăng timeout lên 120 giây (2 phút)
        cancelToken: cancelTokenRef.current.token
      };
      
      let response;
      
      if (type === 'multiple') {
        // Upload multiple images - convert to base64
        setProgress(5); // Bắt đầu hiển thị tiến trình
        
        // Compress and convert to base64
        const base64Images = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          const compressedFile = await compressImage(selectedFiles[i]);
          const base64 = await fileToBase64(compressedFile);
          base64Images.push(base64);
          setProgress(5 + Math.round((i + 1) / selectedFiles.length * 85));
        }
        
        setProgress(90); // Đã convert xong
        
        console.log('Bắt đầu gửi request tải lên nhiều ảnh (base64)');
        response = await axios.post(`${API_URL}/api/upload/images`, { images: base64Images }, config);
        console.log('Kết quả trả về từ server:', response.data);
        
        if (response.data && response.data.photos) {
          console.log('Tải lên thành công, cập nhật UI');
          onImageUploaded(response.data.photos);
          
          toast.success('Tải lên ảnh thành công', { 
            autoClose: 3000,
            closeButton: true,
            pauseOnHover: false,
            draggable: true
          });
          
          // Clear selected files and previews
          setSelectedFiles([]);
          setPreviewUrls([]);
        } else {
          console.error('Phản hồi từ server không có dữ liệu photos:', response.data);
          toast.error('Phản hồi từ server không hợp lệ. Vui lòng thử lại sau.', { autoClose: 3000 });
        }
      } else {
        // Upload single image (avatar) - convert to base64
        setProgress(5); // Bắt đầu hiển thị tiến trình
        
        const compressedFile = await compressImage(selectedFile);
        setProgress(50);
        
        const base64 = await fileToBase64(compressedFile);
        setProgress(90);
        
        const endpoint = type === 'avatar' ? 'avatar' : 'image';
        const requestData = type === 'avatar' ? { avatar: base64 } : { image: base64 };
        
        console.log('Bắt đầu gửi request tải lên ảnh đơn (base64):', endpoint);
        response = await axios.post(`${API_URL}/api/upload/${endpoint}`, requestData, config);
        console.log('Kết quả trả về từ server:', response.data);
        
        if (response.data) {
          console.log('Tải lên thành công, cập nhật UI');
          // Kiểm tra xem response có chứa url hoặc avatar không
          const imageUrl = response.data.url || response.data.avatar || response.data.base64;
          
          if (imageUrl) {
            onImageUploaded(imageUrl);
            
            toast.success('Tải lên ảnh thành công', { 
              autoClose: 3000,
              closeButton: true,
              pauseOnHover: false,
              draggable: true
            });
            
            // Clear selected file and preview
            setSelectedFile(null);
            setPreviewUrl('');
          } else {
            console.error('Phản hồi từ server không có URL hoặc avatar:', response.data);
            toast.error('Phản hồi từ server không hợp lệ. Vui lòng thử lại sau.', { autoClose: 5000 });
          }
        } else {
          console.error('Phản hồi từ server không hợp lệ:', response.data);
          toast.dismiss();
          toast.error('Phản hồi từ server không hợp lệ. Vui lòng thử lại sau.');
        }
      }
      
      setProgress(100);
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack
      });
      
      // Không cần đóng thông báo nữa vì đã có autoClose
      
      // Kiểm tra nếu request bị hủy bởi người dùng
      if (axios.isCancel(error)) {
        console.log('Request bị hủy:', error.message);
        // Không hiển thị thông báo lỗi nếu người dùng chủ động hủy
        return;
      }
      
      // Kiểm tra lỗi định dạng file
      if (error.message === 'Invalid file type') {
        // Thông báo đã được hiển thị trong hàm compressImage
        return;
      }
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.code === 'ECONNABORTED') {
        toast.error('Quá thời gian tải lên. Vui lòng thử lại với ảnh nhỏ hơn hoặc kiểm tra kết nối mạng.');
      } else if (error.response && error.response.status === 413) {
        toast.error('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.');
      } else if (error.message && error.message.includes('Network Error')) {
        toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn và thử lại.');
      } else if (error.response && error.response.status === 415) {
        toast.error('Định dạng file không được hỗ trợ. Vui lòng chỉ sử dụng JPG, PNG hoặc GIF.');
      } else {
        toast.error(error.response?.data?.message || 'Tải lên ảnh thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  const cancelUpload = () => {
    // Hủy request đang chạy nếu có
    if (cancelTokenRef.current && uploading) {
      cancelTokenRef.current.cancel('Người dùng hủy tải lên');
      toast.info('Đã hủy quá trình tải lên');
      setUploading(false);
      setProgress(0);
    }
    
    if (type === 'multiple') {
      // Release object URLs to avoid memory leaks
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
    } else {
      // Release object URL to avoid memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };
  
  // Hàm xóa ảnh
  const deleteImage = async (imageUrl, index) => {
    try {
      setUploading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Bạn cần đăng nhập để xóa ảnh');
        setUploading(false);
        return;
      }
      
      // Kiểm tra xem imageUrl có phải là object hay string
      const finalImageUrl = typeof imageUrl === 'object' && imageUrl.url ? imageUrl.url : imageUrl;
      
      console.log('Deleting image with data:', {
        imageUrl: finalImageUrl,
        type: 'photo'
      });
      
      // Gọi API xóa ảnh (base64 - chỉ cần xóa khỏi database)
      const response = await axios.delete(`${API_URL}/api/upload/image`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          imageUrl: finalImageUrl,
          type: 'photo'
        }
      });
      
      // Nếu xóa thành công trên server, cập nhật UI
      if (response.status === 200) {
        // Tạo bản sao của mảng ảnh hiện tại
        const newImages = [...currentImages];
        
        // Xóa ảnh khỏi mảng
        newImages.splice(index, 1);
        
        // Cập nhật lại mảng ảnh
        onImageUploaded(newImages);
        
        // Hiển thị thông báo thành công
        toast.success('Đã xóa ảnh thành công', { 
          autoClose: 3000,
          closeButton: true,
          pauseOnHover: false,
          draggable: true
        });
        
        // Hiển thị thông báo tùy chỉnh
        setCustomToastMessage('Đã xóa ảnh thành công');
        setShowCustomToast(true);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Image URL being deleted:', imageUrl);
      
      // Nếu có lỗi, vẫn cập nhật UI và database
      try {
        // Xóa ảnh khỏi database người dùng bằng cách cập nhật mảng photos
        const token = localStorage.getItem('token');
        const finalImageUrl = typeof imageUrl === 'object' && imageUrl.url ? imageUrl.url : imageUrl;
        
        // Tạo mảng ảnh mới không bao gồm ảnh cần xóa
        const newImages = [...currentImages];
        newImages.splice(index, 1);
        
        // Cập nhật hồ sơ người dùng với mảng ảnh mới
        await updateProfile({
          photos: newImages
        });
        
        // Cập nhật UI
        onImageUploaded(newImages);
        
        toast.error(error.response?.data?.message || 'Không thể xóa ảnh trên server, nhưng đã cập nhật local.');
      } catch (dbError) {
        console.error('Error removing photo from database:', dbError);
        toast.error(error.response?.data?.message || 'Xóa ảnh thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setUploading(false);
    }
  };
  
  // Effect để tự động ẩn thông báo tùy chỉnh sau 3 giây
  useEffect(() => {
    let timer;
    if (showCustomToast) {
      timer = setTimeout(() => {
        setShowCustomToast(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCustomToast]);
  
  // Effect để xử lý sự kiện click bên ngoài để đóng menu tùy chọn
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showImageOptions && !event.target.closest('.image-option-container')) {
        setShowImageOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Thêm sự kiện ESC để đóng menu
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showImageOptions) {
        setShowImageOptions(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showImageOptions]);

  return (
    <div className="w-full">
      {/* Đã loại bỏ thông báo tùy chỉnh và sử dụng toast.js thay thế */}
      
      {type === 'multiple' ? (
        // Multiple images uploader
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Ảnh của bạn ({currentImages.length}/{maxImages})
            </label>
            
            {/* Hiển thị hướng dẫn khi đang kéo ảnh */}
            {isDragging && (
              <div className="bg-yellow-100 text-yellow-800 p-2 rounded-md mb-2 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Kéo ảnh đến vị trí mới và thả để thay đổi thứ tự
              </div>
            )}
            
            <div className="border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
              <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col space-y-2">
                  {/* Hàng đầu tiên (ảnh 1-3) */}
                  <Droppable droppableId="photo-gallery-row1" direction="horizontal">
                    {(provided) => (
                      <div 
                        className="grid grid-cols-3 gap-2"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{ minHeight: '100px' }}
                      >
                        {/* Hiển thị 3 ảnh đầu tiên */}
                        {currentImages.slice(0, 3).map((image, index) => (
                          <Draggable 
                            key={`image-${index}`} 
                            draggableId={`image-${index}`} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative bg-white rounded-md overflow-hidden image-option-container ${
                                  snapshot.isDragging ? 'opacity-70 shadow-lg ring-2 ring-yellow-400 z-10' : ''
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  height: '100px',
                                  userSelect: 'none'
                                }}
                              >
                                <img 
                                  src={image.url || image} 
                                  alt={`Ảnh ${index + 1}`}
                                  className="w-full h-full object-cover border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={(e) => handleImageClick(index, e)}
                                />
                                <div className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                                  {index + 1}
                                </div>
                                
                                {/* Hiển thị tùy chọn khi người dùng nhấp vào ảnh */}
                                {selectedImageIndex === index && showImageOptions && (
                                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center space-y-2 image-option-container">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteImage(image.url || image, index);
                                        setShowImageOptions(false);
                                      }}
                                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                                      disabled={uploading}
                                    >
                                      {uploading ? "Đang xử lý..." : "Xóa ảnh"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {/* Điền các ô trống nếu chưa đủ 3 ảnh */}
                        {currentImages.length < 3 && Array.from({ length: 3 - currentImages.length }).map((_, index) => (
                          <div 
                            key={`empty-row1-${index}`} 
                            className="border-2 border-dashed border-gray-300 rounded-md h-24 flex items-center justify-center bg-gray-100"
                          >
                            <span className="text-gray-400 text-xs">Trống</span>
                          </div>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  
                  {/* Hàng thứ hai (ảnh 4-6) */}
                  <Droppable droppableId="photo-gallery-row2" direction="horizontal">
                    {(provided) => (
                      <div 
                        className="grid grid-cols-3 gap-2"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{ minHeight: '100px' }}
                      >
                        {/* Hiển thị ảnh từ 4-6 */}
                        {currentImages.slice(3, 6).map((image, index) => (
                          <Draggable 
                            key={`image-${index + 3}`} 
                            draggableId={`image-${index + 3}`} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative bg-white rounded-md overflow-hidden image-option-container ${
                                  snapshot.isDragging ? 'opacity-70 shadow-lg ring-2 ring-yellow-400 z-10' : ''
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  height: '100px',
                                  userSelect: 'none'
                                }}
                              >
                                <img 
                                  src={image.url || image} 
                                  alt={`Ảnh ${index + 4}`}
                                  className="w-full h-full object-cover border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={(e) => handleImageClick(index + 3, e)}
                                />
                                <div className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                                  {index + 4}
                                </div>
                                
                                {/* Hiển thị tùy chọn khi người dùng nhấp vào ảnh */}
                                {selectedImageIndex === (index + 3) && showImageOptions && (
                                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center space-y-2 image-option-container">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteImage(image.url || image, index + 3);
                                        setShowImageOptions(false);
                                      }}
                                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                                      disabled={uploading}
                                    >
                                      {uploading ? "Đang xử lý..." : "Xóa ảnh"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {/* Điền các ô trống nếu chưa đủ 3 ảnh trong hàng thứ hai */}
                        {currentImages.length < 6 && currentImages.length > 3 && 
                          Array.from({ length: 6 - currentImages.length }).map((_, index) => (
                            <div 
                              key={`empty-row2-${index}`} 
                              className="border-2 border-dashed border-gray-300 rounded-md h-24 flex items-center justify-center bg-gray-100"
                            >
                              <span className="text-gray-400 text-xs">Trống</span>
                            </div>
                          ))
                        }
                        {currentImages.length <= 3 && 
                          Array.from({ length: 3 }).map((_, index) => (
                            <div 
                              key={`empty-row2-${index}`} 
                              className="border-2 border-dashed border-gray-300 rounded-md h-24 flex items-center justify-center bg-gray-100"
                            >
                              <span className="text-gray-400 text-xs">Trống</span>
                            </div>
                          ))
                        }
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
            </div>
            
            {/* Preview of selected images */}
            {previewUrls.length > 0 && (
              <div className="mt-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Ảnh đã chọn để tải lên:</p>
                <div className="border-2 border-yellow-200 rounded-lg p-2 bg-yellow-50">
                  <div className="grid grid-cols-3 gap-2">
                    {previewUrls.map((url, index) => (
                      <div 
                        key={`preview-${index}`} 
                        className="relative bg-white rounded-md overflow-hidden shadow-sm h-24"
                      >
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover border border-yellow-300"
                        />
                        <div className="absolute top-1 right-1 bg-yellow-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-sm">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload controls */}
            <div className="flex flex-col space-y-2">
              {currentImages.length < maxImages && (
                <div className="flex items-center">
                  <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer mr-2">
                    Chọn ảnh
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                    />
                  </label>
                  <span className="text-sm text-gray-500">
                    {maxImages - currentImages.length} ảnh còn lại
                  </span>
                </div>
              )}
              
              {selectedFiles.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={uploadImage}
                    disabled={uploading}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    {uploading ? `Đang tải lên... ${progress}%` : 'Tải lên'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelUpload}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              )}
              
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Single image uploader (avatar)
        <div>
          <div className="mb-4">
            
            <div className="flex flex-col items-center space-y-4">
              {/* Current image */}
              {currentImage && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 mx-auto image-option-container">
                    <img 
                      src={currentImage} 
                      alt="Current" 
                      className="w-full h-full object-cover"
                    />
                  
                  {/* Không hiển thị tùy chọn khi nhấp vào ảnh đại diện */}
                </div>
              )}
              
              {/* Preview image */}
              {previewUrl && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-300 mx-auto">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Mới</span>
                  </div>
                </div>
              )}
              
              {/* Empty placeholder */}
              {!currentImage && !previewUrl && (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 mx-auto">
                  <span className="text-gray-500 text-xl">?</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-center">
              <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer">
                Chọn ảnh
                <input
                  id="avatar-file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {selectedFile && (
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={uploadImage}
                  disabled={uploading}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  {uploading ? `Đang tải lên... ${progress}%` : 'Tải lên'}
                </button>
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Hủy
                </button>
              </div>
            )}
            
            {uploading && (
              <div className="w-3/4 mx-auto bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;