const { Controller } = require('egg');

class UserController extends Controller {
  async create() {
    const body = this.ctx.request.body;
    this.ctx.validate({
      username: { type: 'string' },
      email: { type: 'email' },
      password: { type: 'string' },
    });

    const userService = this.service.user;

    if (await userService.findByUsername(body.username)) {
      this.ctx.throw(422, '用户已存在');
    }

    if (await userService.findByEmail(body.email)) {
      this.ctx.throw(422, '邮箱已存在');
    }

    const user = await userService.createUser(body);

    const token = userService.createToken({
      userId: user._id,
    });

    this.ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }

  async login() {
    // 1. 基本数据验证
    const body = this.ctx.request.body;
    this.ctx.validate({
      email: { type: 'email' },
      password: { type: 'string' },
    }, body);
    // 2. 校验邮箱是否存在
    const userService = this.service.user;
    const user = await userService.findByEmail(body.email);
    if (!user) {
      this.ctx.throw(422, '用户不存在');
    }
    // 3. 校验密码是否正确
    if (!body.password || this.ctx.helper.md5(body.password) !== user.password) {
      this.ctx.throw(422, '密码不正确');
    }
    // 4. 生成token
    const token = userService.createToken({
      userId: user._id,
    });
    // 5. 发送响应数据
    this.ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }

  async getCurrentUser() {
    const user = this.ctx.user;
    this.ctx.body = {
      user: {
        email: user.email,
        token: this.ctx.header.authorization,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }

  async update() {
    const body = this.ctx.request.body;
    this.ctx.validate({
      email: { type: 'email', required: false },
      username: { type: 'string', required: false },
      password: { type: 'string', required: false },
      channelDescription: { type: 'string', required: false },
      avatar: { type: 'string', required: false },
    }, body);

    const UserService = this.service.user;

    if (body.email) {
      if (body.email !== this.ctx.user.email && await UserService.findByEmail(body.email)) {
        this.ctx.throw(422, '邮箱已存在');
      }
    }

    if (body.username) {
      if (body.username !== this.ctx.user.username && await UserService.findByUsername(body.username)) {
        this.ctx.throw(422, '用户名已存在');
      }
    }

    if (body.password) {
      body.password = this.ctx.helper.md5(body.password);
    }

    const user = await UserService.updateUser(body);

    this.ctx.body = {
      user: {
        email: user.email,
        token: this.ctx.header.authorization,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }

  async subscribe() {
    const userId = this.ctx.user._id;
    const channelId = this.ctx.params.userId;
    // 1. 用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throww(422, '用户不能订阅自己');
    }

    // 2. 添加订阅
    const user = await this.service.user.subscribe(userId, channelId); // 返回被订阅者

    // 3. 发送响应结果
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed: true,
      },
    };
  }

  async unsubscribe() {
    const userId = this.ctx.user._id;
    const channelId = this.ctx.params.userId;
    // 1. 用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throww(422, '用户不能订阅自己');
    }

    // 2. 取消订阅
    const user = await this.service.user.unsubscribe(userId, channelId); // 返回被取消订阅者

    // 3. 发送响应结果
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed: false,
      },
    };
  }

  async getUser() {
    // 获取订阅状态
    let isSubscribed = false;
    if (this.ctx.user) {
      const record = await this.app.model.Subscription.findOne({ user: this.ctx.user, channel: this.ctx.params.userId });
      if (record) {
        isSubscribed = true;
      }
    }
    // 获取用户信息
    const user = await this.app.model.User.findById(this.ctx.params.userId);
    // 发送响应结果
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed,
      },
    };
  }

  async getSubscriptions() {
    let subscriptions = await this.app.model.Subscription.find({ user: this.ctx.params.userId }).populate('channel');
    subscriptions = subscriptions.map(item => ({
      _id: item.channel._id,
      username: item.channel.username,
      avatar: item.channel.avatar,
    }));
    this.ctx.body = { subscriptions };
  }

}

module.exports = UserController;
