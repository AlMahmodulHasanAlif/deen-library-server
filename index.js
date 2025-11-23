require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

//mongoURI

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.ill4a2j.mongodb.net/?appName=Cluster0`;

//mongoDB

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // await client.connect();

    const db = client.db("deen_db");
    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments");

    //comments post
    app.post("/add-comment", async (req, res) => {
      const comment = req.body;
      comment.createdAt = new Date();

      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    //comments-get

    app.get("/comments/:bookId", async (req, res) => {
      const bookId = req.params.bookId;

      const result = await commentsCollection
        .find({ bookId })
        .sort({ createdAt: -1 })
        .toArray();

      res.send(result);
    });

    //all-books

    app.get("/all-books", async (req, res) => {
      const sortParam = req.query.sort;
      let sortOption = { _id: -1 };

      if (sortParam === "rating_asc") {
        sortOption = { rating: 1 };
      } else if (sortParam === "rating_desc") {
        sortOption = { rating: -1 };
      }

      const cursor = booksCollection.find().sort(sortOption);
      const result = await cursor.toArray();
      res.send(result);
    });

    //latest-books
    app.get("/latest-books", async (req, res) => {
      const cursor = booksCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    //myBooks

    app.get("/myBooks", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //book-details
    app.get("/book-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    //add book
    app.post("/add-book", async (req, res) => {
      const newBook = req.body;
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });

    //update book
    app.patch("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBook = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatedBook,
      };
      const result = await booksCollection.updateOne(query, update);
      res.send(result);
    });
    //delete book
    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
