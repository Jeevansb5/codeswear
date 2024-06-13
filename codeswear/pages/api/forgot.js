import Forgot from "@/models/Forgot";
import User from "@/models/User";
import connectDb from "@/middleware/mongoose";
import jsonwebtoken from "jsonwebtoken"
import CryptoJS from "crypto-js";
import { sendMail } from "../../service/mailService";



const handler = async (req, res) => {

    //check if the user exist in data base
    let fgUser = await Forgot.findOne({ "email": req.body.email })

    // send an email to user
    if (req.body.sendMail && fgUser) {
        let token = fgUser.token;

        let text = ` We have sent you this email in response to your request to reset your password on Codeswear.com. 
    To reset your password for, please follow the link below:
    <a href="http://localhost:3000/forgot?token=${token}">Click here to reset your password</a>
    <br/><br/>
    We recommend that you keep your password secure and not share it with anyone.If you feel your password has been compromised, you can change it by going to your My Account Page and Change your password.
    <br/><br/>`

        await sendMail(
            "Reset Your codeswear.com account password ",
            req.body.email,
            text
        );

        res.status(200).json({ success: true });
    }

    if (req.method == 'POST' && !req.body.sendMail) {
        let token = req.body.token
        let user = jsonwebtoken.verify(token, "process.env.JWT_SECRET")
        let dbUser = await User.findOne({ email: user.email })
        if (req.body.password == req.body.cpassword) {
            let up = await User.findOneAndUpdate({ email: user.email }, { password: CryptoJS.AES.encrypt(req.body.cpassword, process.env.AES_SECRET).toString() })
            res.status(200).json({ success: true });
            return
        }
        else {
            res.status(200).json({ success: false });
        }
    }
    else {
        res.status(400).json({ error: "error" });
    }

}
export default connectDb(handler);