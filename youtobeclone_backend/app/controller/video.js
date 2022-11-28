const { Controller } = require('egg');

class VideoController extends Controller {

  async createVideo() {
    const body = this.ctx.request.body;
    const { Video } = this.app.model;
    this.ctx.validate({
      title: { type: 'string' },
      description: { type: 'string' },
      vodVideoId: { type: 'string' },
      cover: { type: 'string' },
    }, body);
    body.user = this.ctx.user._id;
    const video = await new Video(body).save();
    this.ctx.status = 201;
    this.ctx.body = { video };
  }

  async getVideo() {
    const { Video, VideoLike, Subscription } = this.app.model;
    const { videoId } = this.ctx.params;
    let video = await Video.findOne({ vodVideoId: videoId }).populate('user', '_id username avatar subscribersCount');

    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }

    video = video.toJSON();

    video.isLiked = false;
    video.isDisliked = false;
    video.user.isSubscribed = false; // 是否已订阅作者

    if (this.ctx.user) {
      const userId = this.ctx.user._id;
      if (await VideoLike.findOne({ user: userId, video: videoId, like: 1 })) {
        video.isLiked = true;
      }
      if (await VideoLike.findOne({ user: userId, video: videoId, like: -1 })) {
        video.isDisliked = true;
      }
      if (await Subscription.findOne({ user: userId, channel: video.user._id })) {
        video.user.isSubscribed = true;
      }
    }

    this.ctx.body = { video };
  }

  async getVideos() {
    const { Video } = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const [ videos, videoCount ] = await Promise.all([
      Video.find().populate('user')
        .sort({ createAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Video.countDocuments(),
    ]);
    this.ctx.body = 'test deploy';
    // this.ctx.body = {
    //   videos,
    //   videoCount,
    // };
  }

  async getUserVideos() {
    const { Video } = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    const userId = this.ctx.params.userId;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const [ videos, videoCount ] = await Promise.all([
      Video.find({ user: userId }).populate('user')
        .sort({ createAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Video.countDocuments({ user: userId }),
    ]);
    this.ctx.body = {
      videos,
      videoCount,
    };

  }

  async getUserFeedVideos() {
    const { Video, Subscription } = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    const userId = this.ctx.user._id;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const channels = await Subscription.find({ user: userId }).populate('channel');
    const [ videos, videoCount ] = await Promise.all([
      Video.find({
        user: {
          $in: channels.map(item => item.channel._id),
        },
      }).populate('user')
        .sort({ createAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Video.countDocuments({
        user: {
          $in: channels.map(item => item.channel._id),
        },
      }),
    ]);
    this.ctx.body = {
      videos,
      videoCount,
    };
  }

  async updateVideo() {
    const { body } = this.ctx.request;
    const { Video } = this.app.model;
    const { videoId } = this.ctx.params;
    const userId = this.ctx.user._id;

    this.ctx.validate({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
      vodVideoId: { type: 'string', required: false },
      cover: { type: 'string', required: false },
    }, body);

    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }
    if (!video.user.equals(userId)) {
      this.ctx.throw(403);
    }

    Object.assign(video, this.ctx.helper._.pick(body, [ 'title', 'description', 'vodVideoId', 'cover' ]));
    await video.save();

    this.ctx.body = { video };
  }

  async deleteVideo() {
    const { Video } = this.app.model;
    const { videoId } = this.ctx.params;
    const userId = this.ctx.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      this.ctx.throw(404);
    }

    if (!video.user.equals(userId)) {
      this.ctx.throw(403);
    }

    await video.remove();

    this.ctx.status = 204;

  }

  async createComment() {
    const { body } = this.ctx.request;
    const { Video, Comment } = this.app.model;
    const { videoId } = this.ctx.params;

    this.ctx.validate({ content: { type: 'string' } });

    const video = await Video.findById(videoId);

    if (!video) {
      this.ctx.throw(404);
    }

    let comment = await new Comment({
      content: body.content,
      user: this.ctx.user._id,
      video: videoId,
    }).save();

    video.commentsCount = await Comment.countDocuments({ video: videoId });
    await video.save();

    comment = await comment.populate('user').populate('video').execPopulate();

    this.ctx.body = { comment };
  }

  async getVideoComments() {
    const { videoId } = this.ctx.params;
    const { Comment } = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);

    const getComments = Comment.find({ video: videoId })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('user')
      .populate('video');

    const getCommentCount = Comment.countDocuments({ video: videoId });

    const [ comments, commentsCount ] = await Promise.all([ getComments, getCommentCount ]);

    this.ctx.body = { comments, commentsCount };
  }

  async deleteVideoComments() {
    const { Video, Comment } = this.app.model;
    const { videoId, commentId } = this.ctx.params;

    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      this.ctx.throw(404, 'Comment Not Found');
    }

    if (!comment.user.equals(this.ctx.user._id)) {
      this.ctx.throw(403);
    }

    await comment.remove();

    video.commentsCount = await Comment.countDocuments();
    await video.save();

    this.ctx.status = 204;
  }

  async likeVideo() {
    const { videoId } = this.ctx.params;
    const { Video, VideoLike } = this.app.model;
    const userId = this.ctx.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404);
    }

    const doc = await VideoLike.findOne({ user: userId, video: videoId });

    let isLiked = true;

    if (doc && doc.like === -1) {
      doc.like = 1;
      await doc.save();
    } else if (doc && doc.like === 1) {
      await doc.remove();
      isLiked = false;
    } else {
      await new VideoLike({
        user: userId,
        video: videoId,
        like: 1,
      }).save();
    }

    video.likesCount = await VideoLike.countDocuments({ video: videoId, like: 1 });
    video.dislikesCount = await VideoLike.countDocuments({ video: videoId, like: -1 });

    await video.save();

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isLiked,
      },
    };

  }

  async dislikeVideo() {
    const { videoId } = this.ctx.params;
    const { Video, VideoLike } = this.app.model;
    const userId = this.ctx.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404);
    }

    const doc = await VideoLike.findOne({ user: userId, video: videoId });

    let isDisliked = true;

    if (doc && doc.like === -1) {
      await doc.remove();
      isDisliked = false;
    } else if (doc && doc.like === 1) {
      doc.like = -1;
      await doc.save();
    } else {
      await new VideoLike({
        user: userId,
        video: videoId,
        like: -1,
      }).save();
    }

    video.likesCount = await VideoLike.countDocuments({ video: videoId, like: 1 });
    video.dislikesCount = await VideoLike.countDocuments({ video: videoId, like: -1 });

    await video.save();

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isDisliked,
      },
    };

  }

  async getUserLikedVideos() {
    const userId = this.ctx.user._id;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const { VideoLike, Video } = this.app.model;

    const likedVideos = await VideoLike.find({ user: userId, like: 1 });

    const getVideos = Video
      .find({ _id: { $in: likedVideos.map(item => item.video) } })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('user');
    const getVideoCount = VideoLike.countDocuments({ user: userId, like: 1 });

    const [ videos, videosCount ] = await Promise.all([ getVideos, getVideoCount ]);

    this.ctx.body = { videos, videosCount };
  }

}

module.exports = VideoController;
