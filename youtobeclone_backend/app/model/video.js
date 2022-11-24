module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const VideoSchema = new Schema({
    title: { // 视频标题
      type: String,
      required: true,
    },
    description: { // 视频介绍
      type: String,
      required: true,
    },
    vodVideoId: { // videoId
      type: String,
      required: true,
    },
    cover: { // 视频封面
      type: String,
      required: true,
    },
    user: {
      type: mongoose.ObjectId, // 视频作者
      required: true,
      ref: 'User',
    },
    commentsCouns: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCouns: {
      type: Number,
      default: 0,
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

  return mongoose.model('Video', VideoSchema);
};
