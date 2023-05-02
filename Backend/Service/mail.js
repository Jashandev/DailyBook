const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

module.exports = async function sendmail(email, subject, data){


  // let testAccount = await nodemailer.createTestAccount();

    let transporter = await nodemailer.createTransport({
        // host: "smtp.gmail.com",
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'eino.hettinger21@ethereal.email',
          pass: 'Ja88xsvmDtA6P93Fnk'
          // user: 'Jashansingla709@gmail.com',
          // pass: 'akwuebgglogsukxt'
      },  
      });

      const mailOptions = {
        from: '"Dailybook" <secure.services@Dailybook.com>', // sender address
        to: email,
        subject: subject,
        html: data
    }
    let info = await transporter.sendMail(mailOptions);

return("Message sent: %s", info.messageId);

};