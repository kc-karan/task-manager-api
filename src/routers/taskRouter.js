const express = require('express');
const Task = require('../db/models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {

    //const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save();
        res.status(201).send(task);
    } catch(err) {
        res.status(500).send(err);
    }
   
    // task.save().then(() => {
    //     res.status(201).send(task);
    // }).catch( err => {
    //     res.status(406).send(err);
    // })
})


// GET /tasks?completed=true
// (pagination) GET /tasks?limit=10&skip=10 (skip acts like offset)
// (sort) GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if(req.query.sortBy) {
        const part = req.query.sortBy.split(':');
        sort[part[0]] = (part[1] === 'asc') ? 1 : -1;
    }
    if(req.query.completed) {
        match.completed = (req.query.completed === 'true')
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(201).send(req.user.tasks);
    } catch (err) {
        res.status(500).send('No info found');
    }
    // Task.find({}).then(tasks => {
    //     res.status(201).send(tasks);
    // }).catch(err => {
    //     res.status(500).send(err);
    // })
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task) {
            return  res.status(404).send(404);
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
    // Task.findById(req.params.id).then(task => {
    //     if(task) {
    //         return res.status(201).send(task);
    //     }
    //     res.status(404).send(); 
    // }).catch(err => {
    //     res.status(400).send(err)
    // })
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const validProperties = ['description', 'completed'];
    const isValidUpdate = updates.every(update => validProperties.includes(update));
    if(!isValidUpdate) {
        return res.status(400).send({
            error: 'Invalid update!'
        })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id});
        if(!task) {
            return res.status(404).send('User/task not found');
        }
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!deletedTask) {
            return res.status(400).send();
        }
        res.send(deletedTask);
    } catch (err) {
        res.status(400).send(err);
    }
})

module.exports = router;