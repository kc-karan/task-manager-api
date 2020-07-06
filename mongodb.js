//------- CRUD --------

// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID

const {MongoClient, ObjectID} = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

MongoClient.connect(connectionURL, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    if(err)
    {
       return console.log(err);
    }

    const db = client.db(databaseName);

    // db.collection('users').findOne({name: 'Karan'}, (err, user) => {
    //     if(err) {
    //         return console.log(err);
    //     }
        
    //     console.log(user);

    // })

    //this returns a cursor
    // db.collection('tasks').find({ completed: false }).toArray((err, tasks) => {
    //     console.log(tasks);
    // })

    // const updatePromise = db.collection('users').updateOne({
    //     _id: new ObjectID("5efeba7d0bf67c77a4640f41")
    // }, {
    //     $inc: {
    //         name: 'Mike'
    //     }
    // })

    // updatePromise.then((result) => {
    //     console.log(result)
    // })
    // .catch((err) => {
    //     console.log(err);
    // })

    // const updatePromises = db.collection('tasks').updateMany({
    //     completed: false
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // })

    // updatePromises
    // .then((result) => {
    //     console.log(result);
    // })
    // .catch(err => {
    //     console.log(err);
    // })

    db.collection('users').deleteMany({
        age: "27"
    }).then(res => {
        console.log(res.deletedCount);
    }).catch(err => {
        console.log(err);
    })
})
