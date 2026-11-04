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
app.post('/booking', async(req,res)=>{
    const data = req.body;
    delete data._id;
    const result = await bookingCollection.insertOne(data);
    res.send(result);

})