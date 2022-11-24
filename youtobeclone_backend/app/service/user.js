const Service = require('egg').Service;
const jwt = require('jsonwebtoken');

class UserService extends Service {
  get User() {
    return this.app.model.User;
  }

  findByUsername(username) {
    return this.User.findOne({
      username,
    });
  }

  findByEmail(email) {
    return this.User.findOne({
      email,
    }).select('+password');
  }

  async createUser(data) {
    data.password = this.ctx.helper.md5(data.password);
    const user = new this.User(data);
    await user.save();
    return user;
  }

  createToken(data) {
    return jwt.sign(data, this.app.config.jwt.secret, { expiresIn: this.app.config.jwt.expiresIn });
  }

  verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret);
  }

  updateUser(data) {
    return this.User.findByIdAndUpdate(this.ctx.user._id, data, { new: true }); // new: true返回更新之后的数据
  }

  async subscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    const record = await Subscription.findOne({ user: userId, channel: channelId });
    const user = await User.findById(channelId);

    if (!record) {
      await new Subscription({ user: userId, channel: channelId }).save();
      user.subscribersCount++;
      user.save(); // 更新
    }

    return user;
  }

  async unsubscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    const record = await Subscription.findOne({ user: userId, channel: channelId });
    const user = await User.findById(channelId);

    if (record) {
      await record.remove(); // 删除订阅记录
      user.subscribersCount--;
      user.save(); // 更新
    }

    return user;
  }
}

module.exports = UserService;
