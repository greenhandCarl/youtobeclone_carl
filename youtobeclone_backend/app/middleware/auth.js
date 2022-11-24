module.exports = (options = { required: true }) => {
  return async (ctx, next) => {
    let token = ctx.headers.authorization; // Bearer空格token
    token = token ? token.split('Bearer ')[1] : null;

    if (token) {
      try {
        const data = ctx.service.user.verifyToken(token);
        ctx.user = await ctx.model.User.findById(data.userId);
      } catch (err) {
        ctx.throw(401);
      }
    } else {
      if (options.required) ctx.throw(401);
    }

    await next();
  };
};
