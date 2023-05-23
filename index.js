const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jvrjlhy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const carCollection = client.db("carDB").collection("allCars");
    const toysCollection = client.db("carDB").collection("addedToys");

    app.get("/allcars", async (req, res) => {
      const cursor = carCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/cardetails/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.findOne(query);
      res.send(result);
    });

    app.get("/addedtoys", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/addedtoys", async (req, res) => {
      const addedToys = req.body;
      console.log(addedToys);
      const result = await toysCollection.insertOne(addedToys);
      res.send(result);
    });

    app.get("/addedtoys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.put('/addedtoys/:id' , async(req, res) =>{
      const id = req.params.id;
      const toys =req.body
      console.log(toys);
      const filter = {_id : new ObjectId(id)}
      const options = {upsert : true}
      const updatedToys = {
        $set: {
          toyPrice : toys.toyPrice,
          quantity : toys.quantity,
          description : toys.description
        }
      }
      const result = await toysCollection.updateOne(filter , updatedToys , options)
      res.send(result)
    })

    app.delete("addedtoys/:id", (req, res) => {
      const id = req.params.id;
      res.send({ send_from_server: id });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hot Toys is RUNNING");
});

app.listen(port, () => {
  console.log(`Hot toys server is running on port: ${port}`);
});
