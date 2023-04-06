import express from "express";
import { client } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config()
const router = express.Router()

async function generateHashedPassword(password) {
    const NO_OF_ROUNDS = 10;
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt)
    console.log(salt);
    console.log(hashedPassword);
    return (hashedPassword);
}

async function getUserByName(username) {
    return await client
        .db("foodapp")
        .collection("users")
        .findOne({ username: username })
}

router.post("/signup", async function (request, response) {
    const { username,email, password } = request.body;

    const userFromDB = await getUserByName(username);
    console.log(userFromDB);
    if (userFromDB) {
        response.status(404).send({ message: "Username already exisit" });
    } else if (password.length < 8) {
        response.status(404).send({ message: "Password Must be atleast 8 Character" });
    } else {
        const hashedPassword = await generateHashedPassword(password)
        const result = await client
            .db("foodapp")
            .collection("users")
            .insertOne({ username: username,email: email, password: hashedPassword });
        response.send(result);
    }
});

router.post("/login", async function (request, response) {
    const { username, password } = request.body;

    const userFromDB = await getUserByName(username);
    console.log(userFromDB);
    if (!userFromDB) {
        response.status(401).send({ message: "Invalid Username or Password" });
    } else {
        const storedDBPassword = userFromDB.password;
        const isPasswordCheck = await bcrypt.compare(password, storedDBPassword)
        if (isPasswordCheck) {
            const token = jwt.sign({ id: userFromDB._id }, process.env.SECRET_KEY);
            response.send({ message: "Login Successfull", token: token })
        } else {
            response.send({ message: "Invalid Username or Password" })
        }
    }
});

export default router