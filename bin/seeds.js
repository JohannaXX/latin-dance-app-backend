require('../config/db.config');
const faker = require('faker');

const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Match = require('../models/match.model');
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');

const userIds = [];

const danceStyles = [ "salsa cubana", "salsa en linea", "bachata", "kizomba", "mambo", "merengue", "rumba"]

Promise.all([
  User.deleteMany(),
  Post.deleteMany(),
  Comment.deleteMany(),
  Like.deleteMany(),
  Match.deleteMany(),
  Chat.deleteMany(),
  Message.deleteMany()
])
  .then(() => {
    for (let i = 0; i < 30; i++) {
      const user = new User({
        name: faker.name.findName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: '123123123',
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        gallery: [ 
          "https://picsum.photos/300/300",
          "https://picsum.photos/400/300",
          "https://picsum.photos/500/300",
          "https://picsum.photos/400/400",
          "https://picsum.photos/300/300",
          "https://picsum.photos/400/300",
          "https://picsum.photos/300/200",
          "https://picsum.photos/400/400",
        ],
        style: [ 'salsa cubana', 'bachata' ],
        city: faker.address.city(),
        country: faker.address.countryCode(),
        role: 'user',
        validated: true,
        createdAt: faker.date.past()
      })

      user.save()
        .then(u => {

          userIds.push(u._id)

          for(let j = 0; j < 20; j++) {
            const post = new Post({
              user: u._id,
              body: faker.lorem.paragraph(),
              image: "https://picsum.photos/400/400",
              createdAt: faker.date.past()
            })

            post.save()
              .then((p) => {
                for (let k = 0; k < 10; k++) {
                  const c = new Comment({
                    user: userIds[Math.floor(Math.random() * userIds.length)],
                    post: p._id,
                    text: faker.lorem.paragraph(),
                    createdAt: faker.date.past()
                  })

                  c.save()
                }
              })
              .catch(err => console.log(err))
          }
        })
        .catch(err => console.log(err))
    }
  })
  .then(() => {
    const testProfile = new User({
        name: 'Test',
        email: 'test@test.com',
        username: 'Test',
        password: 'Test1234',
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        gallery: [ 
          "https://picsum.photos/300/300",
          "https://picsum.photos/400/300",
          "https://picsum.photos/500/300",
          "https://picsum.photos/400/400",
          "https://picsum.photos/300/300",
          "https://picsum.photos/400/300",
          "https://picsum.photos/300/200",
          "https://picsum.photos/400/400",
        ],
        style: [ 'salsa cubana', 'bachata' ],
        city: faker.address.city(),
        country: faker.address.countryCode(),
        role: 'user',
        activation: { active: true },
        createdAt: faker.date.past()
    });

    testProfile.save()
        .then( testUser => {
            console.log('Test profile: e-mail = test@test.com , password = Test1234');

            for (let i = 0; i < 20; i++) {
                const post = new Post({
                    user: testUser._id,
                    body: faker.lorem.text(),
                    image: "https://picsum.photos/400/400",
                    createdAt: faker.date.past()
                });

                post.save()
                    .then(p => {
                        for (let j = 0; Math.floor(Math.random() * 7); j++) {
                            const comment = new Comment({
                                text: faker.lorem.paragraph(),
                                user: userIds[Math.floor(Math.random() * userIds.length)],
                                post: p._id,
                                createdAt: faker.date.past()
                            });
    
                            comment.save();
                        }
    
                        for (let k = 0; k <= Math.floor(Math.random() * 10) ; k++) {
                            const like = new Like({
                                user: userIds[Math.floor(Math.random() * userIds.length)],
                                post: p._id,
                                createdAt: faker.date.past()
                            });
    
                            like.save();
                        }   
                    })
            }

            for (let i = 0; i < 10; i++) {
                const match = new Match({
                    users: [ userIds[i], testUser._id],
                    status: 'accepted',
                    requester: userIds[i],
                    createdAt: faker.date.past()
                })

                match.save()

                const chat = new Chat({
                    members: [testUser._id, userIds[i]],
                    createdAt: faker.date.past()
                })

                chat.save()

                for (let j = 0; j < 20; j++) {
                    const message = new Message({
                        message: faker.lorem.paragraph(),
                        sender: j % 2 === 0 ? testUser._id : userIds[i],
                        chat: chat._id,
                        status: 'unread',
                        createdAt: faker.date.past()
                    })

                    message.save()
                }
            }

            for (let i = 10; i < 15; i++) {
                const match = new Match({
                    users: [ userIds[i], testUser._id],
                    status: 'pending',
                    requester: testUser._id,
                    createdAt: faker.date.past()
                })

                match.save()
                  .catch(err => console.log(err))
            }

            for (let i = 15; i < 20; i++) {
                const match = new Match({
                    users: [ userIds[i], testUser._id],
                    status: 'pending',
                    requester: userIds[i],
                    createdAt: faker.date.past()
                })

                match.save()
                  .catch(err => console.log(err))
            }

           

        })

  })
  .catch(err => console.log(err))
