import express from 'express';
import jwt from 'jsonwebtoken';
import { ContentModel, LinkModel, UserModel } from './db';
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';
import { randomFn } from './utils';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

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
        title: req.body.title,
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

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;
    await ContentModel.deleteMany({
        contentId,
        // @ts-ignore
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
})

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const share = req.body.share; // 👇 same thing
    // const {share} = req.body; // 👆 same thing
    console.log(share);
    
    if(share) {
        const existingLink = await LinkModel.findOne({
            // @ts-ignore
            userId: req.userId
        });
        if(existingLink) {
            res.json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = randomFn(10);
        console.log(hash);
        
        await LinkModel.create({
            // @ts-ignore
            userId: req.userId,
            hash: hash
        })

        res.json({
            hash
        })
      
    } else {
        await LinkModel.deleteOne({
            // @ts-ignore
            userId: req.userId
        })

        res.json({
            message: "Removed link"
        })
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    });

    if(!link) {
        res.status(411).json({
            message: "Sorry!!! the link is not sharable"
        })
        return;
    }

    // userId
    const content = await ContentModel.find({
        userId: link.userId
    });

    const user = await UserModel.findOne({
        _id: link.userId
    });

    if(!user) {
        res.status(411).json({
            message: "User not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })
})

app.listen(3000);