import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import 'dotenv/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';


const app = express();
const PORT = 5000; 


app.listen(PORT, ()=>{
    console.log("server is running at port", PORT );
});

//middle wire
app.use(cors());
app.use(express.json());


app.get('/', (req,res)=>{
    res.send("server is running gooood");
})


const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojmgvh3.mongodb.net/`);


export async function connecToMongodb(){
    try {
        await client.connect();
        console.log('successfully connected too mongodb');
        return client;

    } catch (error) {
        
    }
}


//Mnogodb Database(practice-1) and collection(usersCollection)  connection
const connectedClient = await connecToMongodb();
const db = connectedClient.db('StudioSpace');
const roomsCollection = db.collection('rooms');

const bookingCollection = db.collection('my-bookings');
const myListingsCollection = db.collection('my-listings');


//get the rooms
app.get('/rooms',async(req,res)=>{
    const results = await roomsCollection.find().sort({rating : -1}).limit(6).toArray();
    
    res.send(results);
})
//all rooms
app.get('/all-rooms',async(req,res)=>{
    const results = await roomsCollection.find().toArray();
    
    res.send(results);
})


//detailed rooms

app.get('/all-rooms/:id', async(req,res)=>{
    const {id} = req.params;
    const results = await roomsCollection.findOne({_id : new ObjectId(id)});
    res.send(results);
})

//post booking data
app.post("/booking", async (req, res) => {
  const data = req.body;

  delete data._id;

  try {
    // Check whether this user has already booked this studio
    const existingBooking = await bookingCollection.findOne({
      userEmail: data.userEmail,
      sid: data.sid,
    });

    if (existingBooking) {
      return res.status(409).send({
        message: "You have already booked this studio.",
      });
    }

    const result = await bookingCollection.insertOne(data);

    res.status(201).send({
      message: "Booking successful!",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to create booking.",
    });
  }
});

//get my bookings

app.get('/my-bookings',async(req,res)=>{
    const results = await bookingCollection.find().toArray();
    res.send(results);
});


//delete booking
app.delete('/my-bookings/:id',async(req,res)=>{
    const {id} = req.params;
    const result = await bookingCollection.deleteOne({_id : new ObjectId(id)});
    res.send(result);
})

//add-listing
app.post('/add-listings', async(req,res)=>{
    const data = req.body;
    const result = await myListingsCollection.insertOne(data);

    console.log(result);
    res.send(result);


});

//all rooms
app.get('/my-listings/:email',async(req,res)=>{
    const {email} = req.params;
    console.log(req.params);
    const result = await myListingsCollection.find({userEmail : email}).toArray();
    console.log(req.params);
    res.send(result);

});

//my booking card delete
app.delete('/my-listings/:id', async(req,res)=>{
    const {id} = req.params;
    const result = await myListingsCollection.deleteOne({_id : new ObjectId(id)});
    res.send(result);

});


app.patch('/my-listings/:id',async(req,res)=>{
    const {id} = req.params;
   const updatedData = { ...req.body };
    delete updatedData._id;
    const result = await myListingsCollection.updateOne(
    {_id : new ObjectId(id)},
    {$set: updatedData}
    )

    res.json(result);
});


//get my listings

app.get('/my-listings/:id',async(req,res)=>{
     const {id} = req.params;
    const result = await myListingsCollection.findOne({_id : new ObjectId(id)});
    res.send(result);
})