
import mongoose, { Schema, model } from "mongoose";

mongoose.connect("mongodb+srv://sarupmondal549:y09BZqUKyA32BwRL@cluster0.q55ja.mongodb.net/brainly");

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})
export const UserModel = model("users", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
    type: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true }
})
export const ContentModel = model("contents", ContentSchema);
