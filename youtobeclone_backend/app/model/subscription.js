module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const SubscriptionSchema = new Schema({
    user: { // 订阅用户
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    channel: { // 订阅频道
      type: mongoose.ObjectId,
      ref: 'User',
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

  return mongoose.model('Subscription', SubscriptionSchema);
};
