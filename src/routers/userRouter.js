const express = require('express');
const User = require('../db/models/user');
const auth = require('../middleware/auth');
const Task = require('../db/models/task');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account');
const router = new express.Router();


// signing up a user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (err) {
        res.status(406).send(err);
    }
    
    // user.save().then(() => {
    //     res.status(201).send(user);
    // }).catch( err => {
    //     res.status(406).send(err);
    // })
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user , token});
    } catch (err) {
        res.status(400).send(err);
    }
})

router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
})

router.get('/users/me', auth, async (req, res) => {
    
   res.send(req.user);
    // User.find({}).then((data) => {
    //     res.send(data);
    // }).catch(err => {
    //     res.status(500).send(err);
    // })
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if(!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }
    try {
        //const user = await User.findById(req.params.id);
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save();
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
        // if(!user) {
        //     return res.status(404).send();
        // }
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const deletedUser = await User.findByIdAndDelete(req.user._id);
        // if(!deletedUser) {
        //     return res.status(400).send();
        // }
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send('User Deleted!');
    } catch (err) {
        res.status(400).send(err);
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'));
        }

        cb(undefined, true);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    try {   
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(400).send(e);
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(400).send();
    }
})

module.exports = router