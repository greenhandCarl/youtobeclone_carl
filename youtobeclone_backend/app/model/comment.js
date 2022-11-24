module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CommentSchema = new Schema({
    content: { // 评论内容
      type: String,
      required: true,
    },
    user: { // 评论用户
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    video: { // 评论视频
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

  return mongoose.model('Comment', CommentSchema);
};
