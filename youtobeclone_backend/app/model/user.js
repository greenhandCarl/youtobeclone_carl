module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false, // 查询中不包含该字段
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    cover: { // 封面
      type: String,
      default: null,
    },
    channelDescription: { // 频道介绍
      type: String,
      default: null,
    },
    subscribersCount: { // 被别人订阅的数量
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

  return mongoose.model('User', UserSchema);
};
