import express from 'express';
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken';
import { ContentModel, UserModel } from './db';
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
    // zod validation
    const username = req.body.username;
    const password = req.body.password;

    try {
        await UserModel.create({
            username: username,
            password: password
        })
    
        res.json({
            message: "You are signed up"
        })
    }
    catch(e) {
        res.status(411).json({
            message: "User are already exits"
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const exitingUser = await UserModel.findOne({
        username,
        password
    })

    if(exitingUser) {
        const token = jwt.sign({
            id: exitingUser._id
        }, JWT_PASSWORD);

        res.json({
            token
        })
    } else{
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        // @ts-ignore
        userId: req.userId,
        tags: []
    })

    res.json({
        message: "Content added"
    })
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        content
    })
})

app.delete("/api/v1/content", (req, res) => {})

app.post("/api/v1/brain/share", (req, res) => {})

app.post("/api/v1/brain/:shareLink", (req, res) => {})

app.listen(3000);