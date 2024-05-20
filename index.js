const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://solosphere-86e7a.web.app',
    'https://solosphere-86e7a.firebaseapp.com',
    'https://qucomeblog-server.vercel.app/'
  ], //deployment link also added here 
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dstmmd5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const blogsCollection = client.db('qucomeDB').collection('Blogs')
    const commentsCollection = client.db('qucomeDB').collection('Comments')
    const wishCollection = client.db('qucomeDB').collection('Wish')

    // Get all Blogs from db
    app.get('/blogs', async (req, res) => {
      const result = await blogsCollection.find().toArray()
      res.send(result)
    })

    // Get individual blogs from db
    app.get('/blog/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.findOne(query)
      res.send(result)

    })
    // Get Wishes blogs from db
    app.get('/wish/:email', async (req, res) => {
      const email = req.params.email;
      const query = { 'owner.email': email }
      const result = await wishCollection.find(query).toArray();
      res.send(result)
    })
    // delete wish
    app.delete('/wish/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await wishCollection.deleteOne(query);
      res.send(result)
    })
    // Update a data
    app.put('/blog/:id', async (req,res)=>{
      const id = req.params.id
      const blogData = req.body;
      const query = { _id: new ObjectId(id)}
      const options = {upsert: true}
      const updateDoc = {
        $set:{
          ...blogData,
        }
        
      }
      const result= await blogsCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })
    //get all blogs data individual by email

    app.get('/blogs/:email', async (req, res) => {
      const email = req.params.email;
      const query = { 'owner.email': email }
      const result = await blogsCollection.find(query).toArray();
      res.send(result)
    })

    // get all comments data
    app.get('/comments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { blogId: id }
      const result = await commentsCollection.find(query).toArray()
      res.send(result)

    })

    // Save comment data in database
    app.post('/comment', async (req, res) => {
      const data = req.body;
      const result = await commentsCollection.insertOne(data)
      res.send(result)
    })
    // Save Wish data in database
    app.post('/wish', async (req, res) => {
      const data = req.body;
      const result = await wishCollection.insertOne(data)
      res.send(result)
    })

    // Save blog data in database
    app.post('/blog', async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await blogsCollection.insertOne(data)
      res.send(result)
    })

    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('QuCome Server Running')
})

app.listen(port, () => {
  console.log('QuCome Server running on port: ', port);
})