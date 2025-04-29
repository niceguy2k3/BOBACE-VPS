const mongoose = require('mongoose');

const secretAdmirerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admirers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    revealed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Method to get count of unrevealed admirers
secretAdmirerSchema.methods.getUnrevealedCount = function() {
  return this.admirers.filter(admirer => !admirer.revealed).length;
};

const SecretAdmirer = mongoose.model('SecretAdmirer', secretAdmirerSchema);

module.exports = SecretAdmirer;