const express = require('express')

const bodyParser = require('body-parser');
const cors = require('cors');
var admin = require('firebase-admin');
const port = 5000;
const app = express();
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./burj-al-arab-3ff18-firebase-adminsdk-ua3gy-733271d844.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lvsvn.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
        console.log(newBooking)
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')){
            const idToken=bearer.split(' ')[1]
            console.log({idToken})
             admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    let tokenEmail = decodedToken.email;
                    const queryEmail =req.query.email;
                    console.log(tokenEmail,queryEmail)
                    if(tokenEmail==req.query.email){
                        bookings.find({email:req.query.email})
                        .toArray((err,documents)=>{
                            res.send(documents)
                        })
                    }
                    else{
                        res.status(401).send("Unauthorized access")
                    }
               })
                .catch(function (error) {
                    res.status(401).send("Unauthorized access")
                });
        }
        else{
            res.status(401).send("Unauthorized access")
        }
            // idToken comes from the client app
           
           bookings.find({email:req.query.email})
           .toArray((err,documents)=>{
               res.send(documents)
           })
    })
});




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)