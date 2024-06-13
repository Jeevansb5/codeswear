import Order from "@/models/Order";
import Product from "@/models/Product";
import connectDb from "@/middleware/mongoose";
import PaytmChecksum from "paytmchecksum";


const handler = async (req, res) => {
  let order;
  // validate paytm checksum
  let paytmchecksum="";
  let paytmParams ={};

  const recived_data= req.body
  for( let Key in recived_data) {
    if (Key=="CHECKSUMHASH") {
      paytmchecksum= recived_data[Key];
    } else {
      paytmParams[Key]=recived_data[Key];
    }
  }

  let isValidChecksum=PaytmChecksum.verifySignature(paytmParams,process.env.PAYTM_MKEY, paytmchecksum);
  if (!isValidChecksum) {
    res.status(500).send("Some error occurred")
    return
  }


  // Update status into order table after checking the transaction status
  if (req.body.STATUS == 'TXN_SUCCESS') {
    order= await Order.findOneAndUpdate({ orderId: req.body.ORDERID }, { status: 'Paid', paymentInfo: JSON.stringify(req.body), transcationid: req.body.TXNID })
    let products=order.products
    for(let slug in products){
      await Product .findOneAndUpdate({slug: slug},{$inc:{"availableQty": - products[slug].aty }})
    }
      }
  else if (req.body.STATUS =='PENDING') {
    order= await Order.findOneAndUpdate({ orderId: req.body.ORDERID }, { status: 'Pending', paymentInfo: JSON.stringify(req.body),transcationid: req.body.TXNID })  
  }

  //Initiate shipping
  // Redirect the customer to order confermation page 
  res.redirect('/order?clearCart=1&id=' + order._id, 200)

  // res.status(200).json({ body: req.body });
}

export default connectDb(handler);