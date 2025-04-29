const Match = require('../models/match.model');
const User = require('../models/user.model');
const Message = require('../models/message.model');

// Get all matches for current user
exports.getMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find all matches that include the current user
    const matches = await Match.find({ users: userId })
      .populate({
        path: 'users',
        select: 'fullName avatar',
        match: { _id: { $ne: userId } } // Only populate the other user
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    // Format the response
    const formattedMatches = matches.map(match => {
      const otherUser = match.users[0]; // Since we filtered out the current user, this is the other user
      
      return {
        _id: match._id,
        user: otherUser,
        lastMessage: match.lastMessage,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
      };
    });
    
    res.json(formattedMatches);
  } catch (error) {
    next(error);
  }
};

// Get match by ID
exports.getMatchById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.id;
    
    // Find the match
    const match = await Match.findById(matchId)
      .populate({
        path: 'users',
        select: '-password -__v'
      });
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy match' });
    }
    
    // Check if the current user is part of this match
    if (!match.users.some(user => user._id.toString() === userId.toString())) {
      return res.status(403).json({ message: 'Bạn không có quyền xem match này' });
    }
    
    res.json(match);
  } catch (error) {
    next(error);
  }
};

// Delete match (unmatch)
exports.deleteMatch = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.id;
    
    // Find the match
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy match' });
    }
    
    // Check if the current user is part of this match
    if (!match.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa match này' });
    }
    
    // Delete all messages associated with this match
    await Message.deleteMany({ matchId });
    
    // Delete the match
    await Match.findByIdAndDelete(matchId);
    
    res.json({ message: 'Đã hủy kết nối thành công' });
  } catch (error) {
    next(error);
  }
};