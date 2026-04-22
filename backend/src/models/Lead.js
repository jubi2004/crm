const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Won'],
      default: 'New',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for performance
leadSchema.index({ isDeleted: 1, status: 1 });
leadSchema.index({ name: 'text', email: 'text' });

// Default query excludes soft-deleted leads
leadSchema.pre(/^find/, function (next) {
  // Only apply if not explicitly querying deleted leads
  if (this._conditions.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
