/**
 * Helper functions for blindate operations
 */

/**
 * Validates if a status transition is allowed
 * @param {string} currentStatus - The current status of the blindate
 * @param {string} newStatus - The new status to transition to
 * @returns {boolean} - Whether the transition is valid
 */
exports.validateStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'pending': ['accepted', 'rejected', 'cancelled'],
    'accepted': ['completed', 'cancelled'],
    'rejected': [], // Không thể chuyển từ rejected sang trạng thái khác
    'completed': [], // Không thể chuyển từ completed sang trạng thái khác
    'cancelled': []  // Không thể chuyển từ cancelled sang trạng thái khác
  };
  
  return validTransitions[currentStatus] && validTransitions[currentStatus].includes(newStatus);
};

/**
 * Sends a notification related to a blindate
 * @param {string} action - The action type (create, accept, reject, update, etc.)
 * @param {Object} blindate - The blindate object
 * @param {string} senderId - The ID of the sender
 * @param {string} recipientId - The ID of the recipient
 */
exports.sendBlindateNotification = async (action, blindate, senderId, recipientId, notificationHelper) => {
  const notificationTypes = {
    'create': {
      type: 'blindate_request',
      content: 'Bạn đã nhận được lời mời Blind date'
    },
    'accept': {
      type: 'blindate_accepted',
      content: 'Lời mời Blind date của bạn đã được chấp nhận'
    },
    'reject': {
      type: 'blindate_rejected',
      content: 'Lời mời Blind date của bạn đã bị từ chối'
    },
    'update': {
      type: 'blindate_updated',
      content: 'Thông tin cuộc hẹn bí ẩn đã được cập nhật'
    },
    'cancel': {
      type: 'blindate_cancelled',
      content: 'Cuộc hẹn bí ẩn đã bị hủy'
    },
    'review': {
      type: 'blindate_reviewed',
      content: 'Đối phương đã đánh giá cuộc hẹn bí ẩn'
    }
  };

  const notificationType = notificationTypes[action];
  if (!notificationType) {
    console.error(`Invalid notification action: ${action}`);
    return;
  }

  await notificationHelper({
    recipient: recipientId,
    sender: senderId,
    type: notificationType.type,
    content: notificationType.content,
    reference: {
      type: 'blindate',
      id: blindate._id
    }
  });
};

/**
 * Validates date details for a blindate
 * @param {Object} dateDetails - The date details to validate
 * @returns {Object} - Validation result with isValid and message
 */
exports.validateDateDetails = (dateDetails) => {
  if (!dateDetails) {
    return { isValid: false, message: 'Thông tin cuộc hẹn không được để trống' };
  }

  // Kiểm tra loại cuộc hẹn
  if (!dateDetails.type) {
    return { isValid: false, message: 'Loại cuộc hẹn là bắt buộc' };
  }
  
  if (!['online', 'offline'].includes(dateDetails.type)) {
    return { isValid: false, message: 'Loại cuộc hẹn không hợp lệ (online/offline)' };
  }
  
  // Kiểm tra thời gian
  if (!dateDetails.scheduledFor) {
    return { isValid: false, message: 'Thời gian hẹn là bắt buộc' };
  }
  
  const scheduledDate = new Date(dateDetails.scheduledFor);
  if (isNaN(scheduledDate.getTime())) {
    return { isValid: false, message: 'Thời gian hẹn không hợp lệ' };
  }
  
  // Kiểm tra thời gian có trong tương lai không
  const now = new Date();
  if (scheduledDate < now) {
    return { isValid: false, message: 'Thời gian hẹn phải trong tương lai' };
  }
  
  // Kiểm tra thời lượng
  if (dateDetails.duration) {
    const duration = parseInt(dateDetails.duration);
    if (isNaN(duration) || duration <= 0) {
      return { isValid: false, message: 'Thời lượng cuộc hẹn không hợp lệ' };
    }
  }
  
  // Kiểm tra địa điểm nếu là cuộc hẹn offline
  if (dateDetails.type === 'offline') {
    if (!dateDetails.location) {
      return { isValid: false, message: 'Địa điểm hẹn là bắt buộc cho cuộc hẹn offline' };
    }
    
    if (!dateDetails.location.name) {
      return { isValid: false, message: 'Tên địa điểm là bắt buộc cho cuộc hẹn offline' };
    }
  }

  return { isValid: true };
};

/**
 * Builds filter criteria for finding blindate matches
 * @param {Object} currentUser - The current user
 * @returns {Object} - The filter criteria
 */
exports.buildMatchFilterCriteria = (currentUser) => {
  // Xác định giới tính quan tâm
  const interestedGenders = currentUser.interestedIn || ['male', 'female'];
  
  // Tính toán độ tuổi
  const minAge = currentUser.agePreference?.min || 18;
  const maxAge = currentUser.agePreference?.max || 100;

  // Tính toán ngày sinh tương ứng với độ tuổi
  const today = new Date();
  const minBirthDate = new Date(today);
  minBirthDate.setFullYear(today.getFullYear() - maxAge - 1);
  minBirthDate.setDate(minBirthDate.getDate() + 1);
  
  const maxBirthDate = new Date(today);
  maxBirthDate.setFullYear(today.getFullYear() - minAge);
  
  // Xây dựng tiêu chí lọc
  const criteria = {};
  
  // Thêm điều kiện giới tính
  if (interestedGenders.length > 0) {
    criteria.gender = { $in: interestedGenders };
  }
  
  // Thêm điều kiện độ tuổi
  if (minBirthDate && maxBirthDate) {
    criteria.birthDate = { $gte: minBirthDate, $lte: maxBirthDate };
  }
  
  // Thêm điều kiện không bị chặn
  criteria.blockedUsers = { $ne: currentUser._id };
  
  // Thêm điều kiện về sở thích giới tính
  if (currentUser.gender) {
    criteria.interestedIn = currentUser.gender;
  }
  
  // Điều kiện cho phép hiển thị
  criteria.showInDiscovery = true;
  
  return criteria;
};

/**
 * Formats match results for client
 * @param {Array} matches - The matches to format
 * @returns {Array} - Formatted matches
 */
exports.formatMatchResults = (matches) => {
  return matches.map(match => {
    const age = calculateAge(match.birthDate);
    return {
      _id: match._id,
      fullName: match.fullName,
      gender: match.gender,
      birthDate: match.birthDate,
      age,
      occupation: match.occupation || 'Chưa cập nhật',
      education: match.education || 'Chưa cập nhật',
      bio: match.bio,
      interests: Array.isArray(match.interests) ? match.interests : [],
      hobbies: Array.isArray(match.hobbies) ? match.hobbies : [],
      photos: Array.isArray(match.photos) ? match.photos : [],
      avatar: match.avatar,
      city: match.city,
      distance: match.distance,
      teaPreferences: Array.isArray(match.teaPreferences) ? match.teaPreferences : [],
      sugarLevel: match.sugarLevel,
      iceLevel: match.iceLevel,
      favoriteTea: match.favoriteTea,
      lookingFor: match.lookingFor
    };
  });
};

/**
 * Calculates age from birthdate
 * @param {Date} birthDate - The birthdate
 * @returns {number} - The age
 */
function calculateAge(birthDate) {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}