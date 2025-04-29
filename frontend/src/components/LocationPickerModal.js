import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaTimes, FaCheck, FaExclamationTriangle, FaComments } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';

const LocationPickerModal = ({ blindate, currentUser, onClose, onLocationVoted, onOpenChat, locations: initialLocations, onSelect, selectedLocation: initialSelectedLocation }) => {
  const [locations, setLocations] = useState(initialLocations || []);
  const [selectedLocation, setSelectedLocation] = useState(initialSelectedLocation || null);
  const [customLocation, setCustomLocation] = useState({ name: '', address: '' });
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [userVoted, setUserVoted] = useState(false);
  const [otherUserVoted, setOtherUserVoted] = useState(false);

  // Fetch suggested locations if not provided
  useEffect(() => {
    if (!initialLocations || initialLocations.length === 0) {
      const fetchLocations = async () => {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          const response = await axios.get(`${API_URL}/api/locations/suggested`, config);
          setLocations(response.data);
        } catch (error) {
          console.error('Error fetching locations:', error);
          toast.error('Không thể tải danh sách địa điểm gợi ý');
        }
      };

      fetchLocations();
    }
  }, [initialLocations]);

  // Fetch location status if blindate is provided
  useEffect(() => {
    if (blindate && blindate._id) {
      const fetchLocationStatus = async () => {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          const response = await axios.get(`${API_URL}/api/blindates/${blindate._id}/location-status`, config);
          setLocationStatus(response.data.status);
          setUserVoted(response.data.userVoted);
          setOtherUserVoted(response.data.otherUserVoted);
          
          // If location is already confirmed, select it
          if (response.data.status === 'confirmed' && response.data.locationVoting?.finalLocation) {
            setSelectedLocation({
              name: response.data.locationVoting.finalLocation.name,
              address: response.data.locationVoting.finalLocation.address,
              coordinates: response.data.locationVoting.finalLocation.coordinates
            });
          }
        } catch (error) {
          console.error('Error fetching location status:', error);
        }
      };

      fetchLocationStatus();
    }
  }, [blindate]);

  // Filter locations by type
  const filteredLocations = locations.filter(location => {
    if (location.type === 'cafe' || location.type === 'restaurant' || location.type === 'bar') {
      return true;
    }
    return false;
  });
  
  // Group locations by type
  const groupedLocations = filteredLocations.reduce((acc, location) => {
    if (!acc[location.type]) {
      acc[location.type] = [];
    }
    acc[location.type].push(location);
    return acc;
  }, {});

  // Handle vote location
  const handleVoteLocation = async () => {
    if (!selectedLocation && (!showCustomLocation || !customLocation.name || !customLocation.address)) {
      toast.warning('Vui lòng chọn hoặc nhập địa điểm');
      return;
    }

    const locationData = showCustomLocation ? customLocation : selectedLocation;

    // If onSelect is provided, use it (for DateScheduler)
    if (onSelect) {
      onSelect(locationData);
      return;
    }

    // Otherwise, use the API (for BlindateModal)
    if (blindate && blindate._id) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.post(
          `${API_URL}/api/blindates/${blindate._id}/vote-location`, 
          { location: locationData },
          config
        );
        
        setLocationStatus(response.data.status);
        setUserVoted(true);
        
        if (response.data.status === 'confirmed') {
          toast.success('Địa điểm đã được xác nhận!');
        } else if (response.data.status === 'negotiating') {
          toast.info('Đối phương đã chọn địa điểm khác, hãy thương lượng');
        } else {
          toast.success('Đã gửi lựa chọn địa điểm thành công');
        }
        
        if (onLocationVoted) {
          onLocationVoted(response.data);
        }
      } catch (error) {
        console.error('Error voting location:', error);
        toast.error('Không thể gửi lựa chọn địa điểm');
      } finally {
        setLoading(false);
      }
    }
    
    // Close modal after selection
    onClose();
  };

  // Handle open chat
  const handleOpenChat = async () => {
    if (!blindate || !blindate._id) {
      console.error('Blindate not provided');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/api/blindates/${blindate._id}/initiate-chat`,
        {},
        config
      );
      
      if (onOpenChat) {
        onOpenChat(response.data.chatRoomId);
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
      toast.error('Không thể mở phòng chat thương lượng');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <FaMapMarkerAlt className="mr-3 text-amber-100" size={24} />
                Chọn địa điểm hẹn hò
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-amber-100 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Status section */}
            {locationStatus && (
              <div className={`mb-6 p-4 rounded-lg ${
                locationStatus === 'confirmed' ? 'bg-green-50 border border-green-200' :
                locationStatus === 'negotiating' ? 'bg-amber-50 border border-amber-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center">
                  {locationStatus === 'confirmed' ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : locationStatus === 'negotiating' ? (
                    <FaExclamationTriangle className="text-amber-500 mr-2" />
                  ) : (
                    <FaMapMarkerAlt className="text-blue-500 mr-2" />
                  )}
                  <span className={`font-medium ${
                    locationStatus === 'confirmed' ? 'text-green-700' :
                    locationStatus === 'negotiating' ? 'text-amber-700' :
                    'text-blue-700'
                  }`}>
                    {locationStatus === 'confirmed' ? 'Địa điểm đã được xác nhận' :
                     locationStatus === 'negotiating' ? 'Cần thương lượng về địa điểm' :
                     userVoted && otherUserVoted ? 'Cả hai đã chọn địa điểm' :
                     userVoted ? 'Bạn đã chọn địa điểm, đang chờ đối phương' :
                     otherUserVoted ? 'Đối phương đã chọn địa điểm, đang chờ bạn' :
                     'Chưa có ai chọn địa điểm'}
                  </span>
                </div>
                
                {locationStatus === 'confirmed' && selectedLocation && (
                  <div className="mt-3 bg-white p-3 rounded-lg">
                    <p className="font-medium text-green-800">{selectedLocation.name}</p>
                    <p className="text-green-600 text-sm">{selectedLocation.address}</p>
                  </div>
                )}
                
                {locationStatus === 'negotiating' && (
                  <div className="mt-3">
                    <button
                      onClick={handleOpenChat}
                      className="flex items-center justify-center w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                    >
                      <FaComments className="mr-2" />
                      Mở chat thương lượng
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Location selection section - only show if not confirmed */}
            {locationStatus !== 'confirmed' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-amber-800 text-lg">Chọn địa điểm:</h3>
                  <button
                    type="button"
                    onClick={() => setShowCustomLocation(!showCustomLocation)}
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    {showCustomLocation ? 'Chọn từ danh sách' : 'Nhập địa điểm khác'}
                  </button>
                </div>
                
                {showCustomLocation ? (
                  <div className="space-y-3 mb-6">
                    <input
                      type="text"
                      value={customLocation.name}
                      onChange={(e) => setCustomLocation({ ...customLocation, name: e.target.value })}
                      placeholder="Tên địa điểm"
                      className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      value={customLocation.address}
                      onChange={(e) => setCustomLocation({ ...customLocation, address: e.target.value })}
                      placeholder="Địa chỉ"
                      className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto">
                    {Object.entries(groupedLocations).map(([type, locs]) => (
                      <div key={type} className="space-y-2">
                        <h3 className="font-medium text-amber-800 capitalize">
                          {type === 'cafe' ? 'Quán cà phê' : 
                           type === 'restaurant' ? 'Nhà hàng' : 
                           type === 'bar' ? 'Quán bar' : type}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {locs.map((location) => (
                            <button
                              key={location.name}
                              type="button"
                              onClick={() => setSelectedLocation(location)}
                              className={`p-3 rounded-lg text-left ${
                                selectedLocation && selectedLocation.name === location.name
                                  ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                                  : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                              }`}
                            >
                              <div className="font-medium">{location.name}</div>
                              <div className="text-sm text-amber-600">{location.address}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-6 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 font-medium rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleVoteLocation}
                    disabled={loading || (locationStatus === 'confirmed')}
                    className={`py-2.5 px-6 font-medium rounded-lg transition-colors ${
                      loading ? 'bg-gray-400 text-white cursor-not-allowed' :
                      locationStatus === 'confirmed' ? 'bg-gray-400 text-white cursor-not-allowed' :
                      'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {loading ? 'Đang xử lý...' : 'Gửi lựa chọn'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationPickerModal;