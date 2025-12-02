const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const logger = require('../utils/logger.js');

dotenv.config();

// create transporter for smtp
const transporter= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, 
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


// function to send mail

const sendMail = async (to,subject,text) =>{
    try{
        const mailOptions={
            from: process.env.SMTP_USER,
            to,
            subject,
            text
        }

        const result = await transporter.sendMail(mailOptions);
        logger.info(`Email sent to:  ${to}`)
        // console.log("Email sent: ", result.messageId);
        return result;      
        
    }catch (error){
        logger.info("Error sending email",error);
        console.log("Error sending email",error);
        throw error;


    }
};



module.exports = { sendMail };