require('../config/db.config');
const faker = require('faker');

const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Match = require('../models/match.model');
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const Photo = require('../models/photo.model');

const userIds = [];

const danceStyles = ["Salsa cubana", "Salsa en línea", "Bachata", "Kizomba", "Reggaeton", "Cumbia", "Merengue", "Cha-cha-chá"];

const cityAndCountry = [
    [ 'ES', 'Madrid' ],
    [ 'ES', 'Madrid' ],
    [ 'ES', 'Alicante' ],
    [ 'ES', 'Valencia' ],
    [ 'IT', 'Roma' ],
    [ 'IT', 'Firenze' ],
    [ 'FR', 'Paris' ]
]

const names = [
    [ "Leonardo Vázquez" , "https://s3.amazonaws.com/uifaces/faces/twitter/juangomezw/128.jpg" ],
    [ "Diego González" , "https://s3.amazonaws.com/uifaces/faces/twitter/moynihan/128.jpg" ],
    [ "Giovanni Bianchi", "https://s3.amazonaws.com/uifaces/faces/twitter/kiwiupover/128.jpg" ],
    [ "Carlos Martinez" , "https://s3.amazonaws.com/uifaces/faces/twitter/necodymiconer/128.jpg" ],
    [ "Enrique Rodríguez" , "https://s3.amazonaws.com/uifaces/faces/twitter/peejfancher/128.jpg" ],
    [ "Emiliano Pérez" , "https://s3.amazonaws.com/uifaces/faces/twitter/codepoet_ru/128.jpg" ],
    [ "Matias García", "https://s3.amazonaws.com/uifaces/faces/twitter/Skyhartman/128.jpg" ],
    [ "Javier Hernández", "https://s3.amazonaws.com/uifaces/faces/twitter/ismail_biltagi/128.jpg" ],
    [ "Danilo Rossi" , "https://s3.amazonaws.com/uifaces/faces/twitter/stalewine/128.jpg" ],
    [ "Matteo Valla", "https://s3.amazonaws.com/uifaces/faces/twitter/naitanamoreno/128.jpg" ],
    [ "Jean-Paul Bernard", "https://s3.amazonaws.com/uifaces/faces/twitter/tanveerrao/128.jpg" ],
    [ "Jules Richard", "https://s3.amazonaws.com/uifaces/faces/twitter/ajaxy_ru/128.jpg" ],
    [ "Louis Martin", "https://s3.amazonaws.com/uifaces/faces/twitter/anaami/128.jpg" ],
    [ "Antonio Esposito", "https://s3.amazonaws.com/uifaces/faces/twitter/marcusgorillius/128.jpg" ],
    [ "Jorge Sánchez", "https://s3.amazonaws.com/uifaces/faces/twitter/nilshelmersson/128.jpg" ],
    [ "Francisco Jiménez", "https://s3.amazonaws.com/uifaces/faces/twitter/themadray/128.jpg" ],
    [ "Manuel Gutiérrez", "https://s3.amazonaws.com/uifaces/faces/twitter/vladarbatov/128.jpg" ],
    [ "Mario Torres", "https://s3.amazonaws.com/uifaces/faces/twitter/dorphern/128.jpg" ],
    [ "Ricardo Alonso", "https://s3.amazonaws.com/uifaces/faces/twitter/coreyhaggard/128.jpg" ],
    [ "Sergio Álvarez", "https://s3.amazonaws.com/uifaces/faces/twitter/smenov/128.jpg" ],
    [ "Marco Sanz", "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg" ],
    [ "Alejandro Castro", "https://s3.amazonaws.com/uifaces/faces/twitter/_dwite_/128.jpg" ],
    [ "Francesco Romano", "https://s3.amazonaws.com/uifaces/faces/twitter/heycamtaylor/128.jpg" ],
    [ "Lucas Robert", "https://s3.amazonaws.com/uifaces/faces/twitter/adamnac/128.jpg" ],
    [ "Armando Morales", "https://s3.amazonaws.com/uifaces/faces/twitter/kapaluccio/128.jpg" ],
    [ "Guillermo Ortíz", "https://s3.amazonaws.com/uifaces/faces/twitter/knilob/128.jpg" ],
    [ "Alberto Ramírez", "https://s3.amazonaws.com/uifaces/faces/twitter/vikashpathak18/128.jpg" ],
    [ "Raúl Moreno", "https://s3.amazonaws.com/uifaces/faces/twitter/reideiredale/128.jpg" ],
    [ "Ernesto Domínguez", "https://s3.amazonaws.com/uifaces/faces/twitter/nckjrvs/128.jpg" ],
    [ "Martín Córdoba", "https://s3.amazonaws.com/uifaces/faces/twitter/nckjrvs/128.jpg" ]
]


Promise.all([
    User.deleteMany(),
    Post.deleteMany(),
    Comment.deleteMany(),
    Like.deleteMany(),
    Match.deleteMany(),
    Chat.deleteMany(),
    Message.deleteMany(),
    Photo.deleteMany()
])
    .then(() => {
        for (let i = 0; i < 30; i++) {
            const radomNum = Math.floor(Math.random() * cityAndCountry.length);

            const randomDanceNum = Math.floor(Math.random() * danceStyles.length);
            const dances = [ 
                danceStyles[randomDanceNum ],
                danceStyles[randomDanceNum -1]
            ];

            const user = new User({
                name: names[i][0],
                email: faker.internet.email(),
                password: '123123123',
                avatar: names[i][1],
                bio: faker.lorem.sentences(),
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
                style: dances,
                city: cityAndCountry[radomNum][1],
                country: cityAndCountry[radomNum][0],
                role: 'user',
                validated: true,
                createdAt: faker.date.past()
            })

            user.save()
                .then(u => {
                    userIds.push(u._id)

                    for (let j = 0; j < 5; j++) {
                        const post = new Post({
                            user: u._id,
                            body: faker.lorem.paragraph(),
                            image: "https://picsum.photos/400/400",
                            createdAt: faker.date.past()
                        })

                        post.save()
                            .then((p) => {
                                const photo = new Photo({
                                    user: u._id,
                                    photo: p.image
                                })

                                photo.save()

                                for (let k = 0; k < 5; k++) {
                                    const c = new Comment({
                                        user: userIds[Math.floor(Math.random() * userIds.length)],
                                        post: p._id,
                                        text: faker.lorem.paragraph(),
                                        createdAt: faker.date.past()
                                    })

                                    c.save()

                                    for (let k = 0; k <= Math.floor(Math.random() * 10); k++) {
                                        const like = new Like({
                                            user: userIds[Math.floor(Math.random() * userIds.length)],
                                            post: p._id,
                                            createdAt: faker.date.past()
                                        });

                                        like.save();
                                    }
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
            password: 'Test1234',
            avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/hanna_smi/128.jpg',
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
            style: ['Salsa cubana', 'Bachata'],
            city: 'Madrid',
            country: 'ES',
            role: 'user',
            activation: { active: true },
            createdAt: faker.date.past()
        });

        testProfile.save()
            .then(testUser => {
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
                            const photo = new Photo({
                                user: testUser._id,
                                photo: p.image
                            })

                            photo.save()

                            for (let j = 0; Math.floor(Math.random() * 7); j++) {
                                const comment = new Comment({
                                    text: faker.lorem.paragraph(),
                                    user: userIds[Math.floor(Math.random() * userIds.length)],
                                    post: p._id,
                                    createdAt: faker.date.past()
                                });

                                comment.save();
                            }

                            for (let k = 0; k <= Math.floor(Math.random() * 10); k++) {
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
                        users: [userIds[i], testUser._id],
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
                        users: [userIds[i], testUser._id],
                        status: 'pending',
                        requester: testUser._id,
                        createdAt: faker.date.past()
                    })

                    match.save()
                        .catch(err => console.log(err))
                }

                for (let i = 15; i < 20; i++) {
                    const match = new Match({
                        users: [userIds[i], testUser._id],
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
