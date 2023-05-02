const express = require("express");
const mongoose = require("mongoose");
const User = require("../Models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const fetchuser = require('../middleware/fetchtoken');
const Sendmail = require('../Service/mail');
var jwt = require("jsonwebtoken");
const JWT_SECRET = 'j@shan';


// Register endpoints

router.post(
    "/Register",
    body("name", "name min 3 length").isLength({ min: 3 }).isAlpha('en-US', {ignore: ' '}),
    body("email", "Enter a vaild email").isEmail(),
    body("phone", "Invaild Phone number").isLength({ min:10, max:10 }).isNumeric().isMobilePhone(),
    body("password", "password should be atleast 5 length").isLength({ min: 5 }),
    async (req, res) => {
      try {

      // checking user input fileds

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(403).json({ ValidationErrors: errors.array() , "error":"True" , "msg":"Syntax error" });
      }

      // checking user allready exist or not with email address

      const finduserexist_email = await User.findOne({ email: req.body.email });
      if (finduserexist_email) {
        return res.status(409).json({"error":"True","msg":"this email address already exist" });
      }

      // checking user allready exist or not with moblie number 

      const finduserexist_number = await User.findOne({ phone: req.body.phone });
      if (finduserexist_number) {
        return res.status(409).json({"error":"True","msg":"Moblie Number already exist" });
      }

      //  create otp

      const Randomotp = Math.floor(100000 + Math.random() * 900000);

      // hashing password

      await bcrypt.genSalt(10, async function (err, salt) {
        await bcrypt.hash(req.body.password, salt, async function (_err, hash) {
          // Store hash in your password DB.
          const user = await User.create({
              name : req.body.name.toUpperCase() ,
              phone : req.body.phone ,
              password : hash,
              email : req.body.email.toLowerCase() ,
              Authentication : [{"otp":Randomotp , mailres }] ,
          });
          
          //  create mail for user

          let { email } = req.body;
          const subject = "One Time Password for Get login";

          const maildata = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Dailybook</a>
            </div>
            <p style="font-size:1.1em">Hi ${user.name}</p>
            <p>Thank you for choosing dailybook. Use the following OTP to complete your Sign up procedures. OTP is valid for 3 minutes</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${Randomotp}</h2>
            <p style="font-size:0.9em;">Regards,<br />dailybook</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              <p>Jashan Singla</p>
              <p>1600 Amphitheatre Parkway</p>
              <p>California</p>
            </div>
          </div>
        </div>`;

        //  sending mail

          const mailres = await Sendmail( email , subject , maildata);

            // create token for a user

            const data = {
              Userinfo: {
                id: user.id,
                mailres,
              },
            };

          const token = jwt.sign(data, JWT_SECRET);
        
          res.json({ "error" : "false" , token , "OTP": "true" });
        });
      });
      
    } catch (error) {
      return res.status(500).json({"error":error.message,"msg":"Intarnal server error"});
    }
  }
);

//  endpionts for otp resend

router.get( "/OTP_RESEND", fetchuser , async (req, res) => {
      try {

        const userid = req.data.Userinfo.id
        const token_mailres = req.data.Userinfo.mailres

        const user = await User.findOne({_id:userid}).select("-password")

        if (!user) {
          return res.status(409).json({"error":"True","msg":"Authentication failed" });
        }

        if ( user.Authentication.length === 0 ) {
            return res.status(402).json({"error":"True","msg":"Processor declined" });
        }

        if ( user.Authentication.length >= 3 ) {
            return res.status(402).json({"error":"True","msg":"OTP send limit exceeded" });
        }

        const database_Authentication_array = user.Authentication[0];
        const database_mailres = database_Authentication_array.database_mailres;

        if (!token_mailres === database_mailres) {
          return res.status(402).json({"error":"True","msg":"Processor declined" });
        }

             //  create mail for user

             const Randomotp = Math.floor(100000 + Math.random() * 900000);

             const subject = "One Time Password for Get login";

             const maildata = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
             <div style="margin:50px auto;width:70%;padding:20px 0">
               <div style="border-bottom:1px solid #eee">
                 <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Dailybook</a>
               </div>
               <p style="font-size:1.1em">Hi ${user.name}</p>
               <p>Thank you for choosing dailybook. Use the following OTP to complete your Sign up procedures. OTP is valid for 3 minutes</p>
               <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${Randomotp}</h2>
               <p style="font-size:0.9em;">Regards,<br />dailybook</p>
               <hr style="border:none;border-top:1px solid #eee" />
               <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                 <p>Jashan Singla</p>
                 <p>1600 Amphitheatre Parkway</p>
                 <p>California</p>
               </div>
             </div>
           </div>`;
   
           //  sending mail

             var mailres = await Sendmail( user.email , subject , maildata);

            //   update otp and mailres in database

            var new_otp = [{ "otp":Randomotp , mailres  }] ;

             let New_Authentication_array = [].concat( user.Authentication, new_otp );

             let NewUser = { Authentication : New_Authentication_array };

             await User.findOneAndUpdate({_id:userid},{$set:NewUser},{new:true});
   
               // create token for a user
   
               const data = {
                 Userinfo: {
                   id: user.id,
                   mailres,
                 },
               };
   
             const token = jwt.sign(data, JWT_SECRET);
           
             res.json({ "error" : "false" , token , "OTP": "true" });


            
    } catch (error) {
        return res.status(500).json({"error":error,"msg":"Intarnal server error"});
      }
    }
  );

 // endpionts for cancel trxn

  router.get( "/OTP_cancel", fetchuser , async (req, res) => {
    try {

        const userid = req.data.Userinfo.id

        const BlankLoginUser = { Authentication : [] };
        let BlankUserotps = await User.findOneAndUpdate({_id:userid},{$set:BlankLoginUser},{new:true});

        if( BlankUserotps.Authentication.length === 0 ){
          return res.json({"error":"false","msg":"Session cancelled successfully"});
        } else {
          return res.json({"error":"true","msg":"Processor declined"});
        }

    } catch (error) {
      return res.status(500).json({"error":error,"msg":"Intarnal server error"});
    }
  }
);

//  entpionts checking otp 

router.post(
  "/OTP",
  body("OTP", "Enter a vaild otp").isLength({ min:6, max:6 }).isNumeric(),
  fetchuser , async (req, res) => {
    try {

           // checking user input fileds

           const errors = validationResult(req);
           if (!errors.isEmpty()) {
             return res.status(403).json({ ValidationErrors: errors.array() , "error":"True" , "msg":"Enter a vaild otp" });
           }

          const userid = req.data.Userinfo.id
          const user = await User.findOne({_id:userid}).select("-password")

          if (!user) {
            return res.status(409).json({"error":"True","msg":"Authentication failed" });
          }

          const data = {
            Userinfo: {
              id: user.id,
            },
          };

          const token = jwt.sign(data, JWT_SECRET);

          for (let index = 0; index < user.Authentication.length; index++) {
            const element = user.Authentication[index];

                if (element.otp === req.body.OTP) {

                    if (element.mailres === req.data.Userinfo.mailres) {

                        var otp_expiry_time = new Date(element.vaild.getTime() + 3*60000).getTime();

                        if (otp_expiry_time >= new Date().getTime() ) {

                                const NewUser = { Authentication : [] };
                                let Data = await User.findOneAndUpdate({_id:userid},{$set:NewUser},{new:true});
                                return res.json({ "error" : "false" , token , "vaild": "true" });
                                
                        } else { return res.status(402).json({ "error" : "true" , "msg":"otp expired" }); }
                        
                    } else { return res.status(402).json({ "error" : "true" , "msg":"otp server error" }); }

                }
          }

            return res.json({ "error" : "true" , "msg":"otp Authentication failed" });
      
    } catch (error) {
      return res.status(500).json({"error":error.message,"msg":"Intarnal server error"});
    }
  }
);

// login endpoints

router.post(
  "/Login",
  body("email", "Enter a vaild email").isEmail(),
  body("password", "password should be atleast 5 length").isLength({ min: 5 }),
  async (req, res) => {
    try {

      // checking user input fileds

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(403).json({ ValidationErrors: errors.array() , "error":"True" , "msg":"Syntax error" });
      }

      // checking user exist or not

      let { email, password } = req.body;
      email = email.toLowerCase()

      const Userinfo = await User.findOne({ email });
      if (!Userinfo) {
        return res.status(403).json({"error":"True","msg":"sorry user with this email can't exist" });
      }

      //  checking password

      const match = await bcrypt.compare( password, Userinfo.password);
          if (!match) {
            return res.status(403).json({"error":"True","msg":"password incorrect" });
          }

          //  create otp for user

          const Randomotp = Math.floor(100000 + Math.random() * 900000);
          const BlankLoginUser = { Authentication : [] };
          let BlankUserotps = await User.findOneAndUpdate({_id:Userinfo.id},{$set:BlankLoginUser},{new:true});

      //  sending mail to user

      
      const subject = "One Time Password for Get login";

      const maildata = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Dailybook</a>
        </div>
        <p style="font-size:1.1em">Hi ${Userinfo.name}</p>
        <p>Thank you for choosing dailybook. Use the following OTP to complete your Login procedures. OTP is valid for 3 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${Randomotp}</h2>
        <p style="font-size:0.9em;">Regards,<br />dailybook</p>
        <hr style="border:none;border-top:1px solid #eee" />
        < style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Jashan Singla</p>
          <p>1600 Amphitheatre Parkway</p>
          <p>California</p>
        </      </div>
div>
    </div>`;

    //  calling mail funcation

      const mailres = await Sendmail( email , subject , maildata);

          // create token for a user

          const data = {
            Userinfo: {
              id: Userinfo.id,
              mailres
            }
          };
          const token = jwt.sign(data, JWT_SECRET);

          //  update otp in database

      const NewUser = { Authentication : [ {"otp":Randomotp , mailres }] };
      let login_otp_update = await User.findOneAndUpdate({_id:Userinfo.id},{$set:NewUser},{new:true});

      res.json({ "error" : "false" , token , "OTP": "true" });

    } catch (error) {
      return res.status(500).json({"error":error.message,"msg":"Intarnal server error"});
    }
  }
);

// let user loged in authication  

router.get("/Authication", fetchuser , async (req, res) => {
    try {
      const userid = req.data.Userinfo.id
      const user = await User.findOne({_id:userid}).select("-password")
      res.json({ "error" : "false" , user })

    } catch (error) {
      return res.status(500).json({"error":error.message,"msg":"Intarnal server error"});
    }

  });



module.exports = router; 