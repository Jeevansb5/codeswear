import Order from "@/models/Order";
import Product from "@/models/Product";
import connectDb from "@/middleware/mongoose";
import pincodes from '@/pincodes.json'


const https = require('https');

const PaytmChecksum = require('paytmchecksum');

const handler = async (req, res) => {
    if (req.method == 'POST') {

        // Check if pincode is Serviceable
        if (!Object.keys(pincodes).includes(req.body.pincode)) {
            res.status(200).json({ success: false, "error": "The Pincode you entered is not Serviceable!!", cartClear: false })
        }

        //check If the cart is tampered with
        let product, sumTotal = 0;
        let cart = req.body.cart;

        if (req.body.subTotal <= 0) {
            res.status(200).json({ success: false, "error": "Cart is Empty! Please build your cart and try again!", cartClear: false })
            return
        }

        for (let item in cart) {
            sumTotal += cart[item].price * cart[item].qty
            product = await Product.findOne({ slug: item })
            //Check if the cart Item are out of stock 
            if (product.availableQty < cart[item].qty) {
                res.status(200).json({ success: false, "error": "Some items in your cart went out of stock. Stay tunned!!", cartClear: true })
                return
            }
            if (product.price != cart[item].price) {
                res.status(200).json({ success: false, "error": "The price of some items in your cart have changed. Please try again", cartClear: true })
                return
            }
        }
        if (sumTotal != req.body.subTotal) {
            res.status(200).json({ success: false, "error": "The price of some items in your cart have changed. Please try again", cartClear: true })
            return
        }


        // check if the details are valid 

        if (req.body.phone.length !== 10 || !Number.isInteger(Number(req.body.phone))) {
            res.status(200).json({ success: false, "error": "PLease enter your 10 digit phone number", cartClear: false })
            return
        }
        if (req.body.pincode.length !== 6 || !Number.isInteger(Number(req.body.pincode))) {
            console.log(Number.isInteger(req.body.pincode));
            res.status(200).json({ success: false, "error": "PLease enter your 6 digit pincode", cartClear: false })
            return
        }

        // Initiate the order corresponding to this order id
        let order = new Order({
            email: req.body.email,
            name: req.body.name,
            orderId: req.body.oid,
            address: req.body.address,
            city: req.body.city,
            phone: req.body.phone,
            pincode: req.body.pincode,
            amount: req.body.subTotal,
            products: req.body.cart
        })
        await order.save();

        // Insert an entry in orders table with status pending
        var paytmParams = {};

        paytmParams.body = {
            "requestType": "Payment",
            "mid": process.env.NEXT_PUBLIC_PAYTM_MID,
            "websiteName": "YOUR_WEBSITE_NAME",
            "orderId": req.body.oid,
            "callbackUrl": `${process.env.NEXT_PUBLIC_HOST}/api/posttransaction`,
            "txnAmount": {
                "value": req.body.subTotal,
                "currency": "INR",
            },
            "userInfo": {
                "custId": req.body.eamil,
            },
        };

        /*
        * Generate checksum by parameters we have in body
        * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
        */
        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MKEY)

        paytmParams.head = {
            "signature": checksum
        };

        var post_data = JSON.stringify(paytmParams);

        const requestAsync = () => {
            return new Promise((resolve, reject) => {

                var options = {

                    /* for Staging */
                    // hostname: 'securegw-stage.paytm.in',

                    /* for Production */
                    hostname: 'securegw.paytm.in',

                    port: 443,
                    path: ` /theia/api/v1/initiateTransaction?mid=${process.env.NEXT_PUBLIC_PAYTM_MID}&orderId=${req.body.oid}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length
                    }
                };

                var response = "";
                var post_req = https.request(options, function (post_res) {
                    post_res.on('data', function (chunk) {
                        response += chunk;
                    });

                    post_res.on('end', function () {
                        // console.log('Response: ', response);

                        let ress = JSON.parse(response).body
                        ress.success = true
                        ress.cartClear = false
                        resolve(ress)
                    });
                });
                post_req.write(post_data);
                post_req.end();
            })
        }



    }
}

export default connectDb(handler);