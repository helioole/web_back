import PostModel from '../models/Post.js';
import checkAuth from '../utils/checkAuth.js';
import checkAdmin from '../utils/checkAdmin.js';

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get last 5 tags from posts
 *     responses:
 *       200:
 *         description: An array of last 5 tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *     tags:
 *       - Tags
 */
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to get tags',
    });
  }
};

/**
* @swagger
* /posts:
*   get:
*     summary: Retrieve all posts
*     responses:
*       200:
*         description: An array of posts
*/
export const getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;

  try {

    const posts = await PostModel.find()
      .populate('user')
      .skip((page - 1) * pageSize) 
      .limit(pageSize) 
      .exec();

    const totalCount = await PostModel.countDocuments();

    res.json({ posts, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get posts' });
  }
};

/**
* @swagger
* /posts/{id}:
*   get:
*     summary: Retrieve a single post by ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: A single post object
*       404:
*         description: Post not found
*/
export const getOne = async (req, res) => {
  try {
      const postId = req.params.id;

      const doc = await PostModel.findOneAndUpdate(
          { _id: postId },
          { $inc: { viewsCount: 1 } },
          { returnDocument: 'after' }
      ).populate('user').exec();

      if (!doc) {
          return res.status(404).json({
              message: 'Post was not found',
          });
      }

      res.json(doc);
  } catch (err) {
      console.error(err);
      res.status(500).json({
          message: 'Failed to return post',
      });
  }
};

/**
* @swagger
* /posts/{id}:
*   delete:
*     summary: Delete a single post by ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Post deleted successfully
*       403:
*         description: No Access or Forbidden
*       404:
*         description: Post not found
*     security:
*       - BearerAuth: []
*/
export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    
    const isAdmin = await checkAdmin(req.userId);

    if (isAdmin) {
      await PostModel.findByIdAndDelete(postId);
      
      return res.status(200).json({ message: 'Post deleted successfully' });
    } else {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
* @swagger
* /posts:
*   post:
*     summary: Create a new post
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               title:
*                 type: string
*               text:
*                 type: string
*               imageUrl:
*                 type: string
*               tags:
*                 type: string
*     responses:
*       200:
*         description: Created post object
*/
export const create = async (req, res) => {
  try {
      const doc = new PostModel({
          title: req.body.title,
          text: req.body.text,
          imageUrl: req.body.imageUrl,
          tags: req.body.tags,
          user: req.userId,
      });

      const post = await doc.save();

      res.json(post);
  } catch (err) {
      console.log(err);
      res.status(500).json({
          message: 'Failed to create post',
      });
  }
};

/**
* @swagger
* /posts/{id}:
*   put:
*     summary: Update a post by ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               title:
*                 type: string
*               text:
*                 type: string
*               imageUrl:
*                 type: string
*               tags:
*                 type: string
*     responses:
*       200:
*         description: Post updated successfully
*       500:
*         description: Failed to update post
*/

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    res.json({
      success: true,
      updatedPost,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to update post',
    });
  }
};