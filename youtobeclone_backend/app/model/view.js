module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ViewSchema = new Schema({
    user: { // 用户
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    video: { // 视频
      type: mongoose.ObjectId,
      ref: 'Video',
      required: true,
    },
    createAt: { // 创建时间
      type: Date,
      default: Date.now,
    },
    updateAt: { // 更新时间
      type: Date,
      default: Date.now,
    },
  });

  return mongoose.model('View', ViewSchema);
};
