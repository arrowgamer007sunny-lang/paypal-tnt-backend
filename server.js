const express = require("express");

const app = express();

app.use(express.json());

let donations = [id: 1,
   username: "Sunny",
   amount: 5];

app.post("/paypal-webhook", (req,res)=>{

   const event = req.body;

   if(event.event_type === "PAYMENT.CAPTURE.COMPLETED"){

      const amount =
      parseFloat(event.resource.amount.value);

      const username =
      event.resource.custom_id || "Anonymous";

      donations.push({
         id: Date.now(),
         username,
         amount
      });

      console.log("New Donation:", username, amount);
   }

   res.sendStatus(200);
});

app.get("/paypal-donations.json",(req,res)=>{
   res.json({donations});
});

app.listen(3000,()=>{
   console.log("Server running");
});
