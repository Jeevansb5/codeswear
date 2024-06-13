// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import User from "@/models/User";
import connectDb from "@/middleware/mongoose";
var CryptoJS = require("crypto-js");
var jwt=require("jsonwebtoken");
import Forgot from "@/models/Forgot";

const handler = async (req, res) => {
    if (req.method == 'POST') {
        let user = await User.findOne({ "email": req.body.email })
        const bytes = CryptoJS.AES.decrypt(user.password, "secret123");
        let decryptedPassword = (bytes.toString(CryptoJS.enc.Utf8));
        if (user) {
            if (req.body.email == user.email && req.body.password == decryptedPassword) {
                var token= jwt.sign({ email: user.email, name: user.name}, 'process.env.JWT_SECRET',{expiresIn:"2d"})
                let fgUser=await Forgot.findOne({"email":user.email})
                if ( fgUser && fgUser.email==user.email) {
                   let c= await Forgot.findOneAndUpdate({email:fgUser.email}, {token: token})
                }
                else{
                    let forgot = new Forgot({
                        email: user.email,
                        token: token
                    })
                    await forgot.save();
                }
                res.status(200).json({ success: true, token, email: user.email});
                
                
                
            }
            else {
                res.status(200).json({ success: false, error: "Invalid Credentials" });
            }
        }
    } else {
        res.status(200).json({ success: false, error: "User not found" });
    }

}

export default connectDb(handler);