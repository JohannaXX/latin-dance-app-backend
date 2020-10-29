const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const postController = require('../controllers/post.controller');
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('./cloudinary.config');

// router.get('/activate/:token', authMiddleware.isNotAuthenticated, userController.activateUser);
// router.get('/auth/slack', authMiddleware.isNotAuthenticated, userController.loginWithSlack);
// router.get('/auth/google', authMiddleware.isNotAuthenticated, userController.loginWithGmail);
// router.get('/auth/google/callback', authMiddleware.isNotAuthenticated, userController.getLoginWithGmail);
router.post('/login', authMiddleware.isNotAuthenticated, userController.doLogin);
router.post('/logout', authMiddleware.isAuthenticated, userController.logout);

router.delete('/user/delete', authMiddleware.isAuthenticated, userController.delete);
router.patch('/user/update', authMiddleware.isAuthenticated, userController.update);
router.get('/user/:id', authMiddleware.isAuthenticated, userController.profile);
router.post('/user', authMiddleware.isNotAuthenticated, upload.single('avatar'), userController.create);

router.get('/contacts', authMiddleware.isAuthenticated, userController.contacts);
router.get('/network', authMiddleware.isAuthenticated, userController.network);
router.patch('/match/:id/update', authMiddleware.isAuthenticated, userController.updateMatch);
router.post('/match', authMiddleware.isAuthenticated, userController.createMatch);

router.delete('/post/comment/:id/delete', authMiddleware.isAuthenticated, postController.deleteComment);
router.post('/post/:id/comments', authMiddleware.isAuthenticated, postController.addComment);
router.delete('/post/:id/delete', authMiddleware.isAuthenticated, postController.delete);
router.get('/post/:id/like', authMiddleware.isAuthenticated, postController.like);
router.patch('/post/:id/update', authMiddleware.isAuthenticated, postController.update);
router.get('/post/:id', authMiddleware.isAuthenticated, postController.show);
router.post('/post', authMiddleware.isAuthenticated, upload.single('image'), postController.create);

router.get('/chats',  authMiddleware.isAuthenticated, chatController.index );
router.post('/chat/:id/messages', authMiddleware.isAuthenticated, chatController.addMessage );
router.delete('/chat/message/:id/delete', authMiddleware.isAuthenticated, chatController.deleteMessage);
router.patch('/chat/message/:id/edit', authMiddleware.isAuthenticated, chatController.updateMessage);
router.get('/chat/:id', authMiddleware.isAuthenticated, chatController.show);
router.post('/chat', authMiddleware.isAuthenticated, chatController.create);

router.get('/', authMiddleware.isAuthenticated, postController.index);

module.exports = router;

