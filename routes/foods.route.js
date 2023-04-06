import express from "express";
import { client } from "../index.js";
import { auth } from "../middleware/auth.js";
import { ObjectId } from "mongodb";

const router = express.Router()

router.get("/", auth, async function (request, response) {

    if (request.query.rating) {
        request.query.rating = +request.query.rating;
    }

    const food = await client
        .db("foodapp")
        .collection("foods")
        .find(request.query)
        .toArray();
    response.send(food);
});

router.get("/:id", auth, async function (request, response) {
    // const { id } = request.params;
    const id = new ObjectId(request.params.id);
    const food = await client.db("foodapp").collection("foods").findOne({ _id: id })
    //const food = foods.find((mv) => mv.id === id);
    console.log(food);
    food ? response.send(food) : response.status(404).send({ message: "food not found" })
});

router.post("/",auth, async function (request, response) {
    try {
        const data = request.body;
        console.log("data", data);
        const result = await client
            .db("foodapp")
            .collection("foods")
            .insertOne(data);
        response.json(result);
    } catch (error) {
        console.log(error);
        return response.json(error.message)
    }

});

router.delete("/:id", auth, async function (request, response) {
    // const { id } = request.params;
    const id = new ObjectId(request.params.id);
    const result = await client
        .db("foodapp")
        .collection("foods")
        .deleteOne({ _id: id });

    result.deletedCount > 0
        ? response.send({ message: "food deleted successfully" })
        : response.status(404).send({ message: "food not found" });
})

router.put("/:id",auth, async function (request, response) {
    try {
        // const { id } = request.params;
        const id = new ObjectId(request.params.id);
        const data = request.body;
        const result = await client
            .db("foodapp")
            .collection("foods")
            .updateOne({ _id: id }, { $set: data });
        response.json(result);
    } catch (error){
        console.log(error);
        return response.json(error.message)
    }
    
});

export default router;