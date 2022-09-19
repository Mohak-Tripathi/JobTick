
const nodemailer = require('nodemailer');

const sendEmail = async options => {
//transporter creation
    const transporter = nodemailer.createTransport({

        host : process.env.SMTP_HOST,
        PORT : process.env.SMTP_PORT,
        auth: {
            user : process.env.SMTP_EMAIL,
            pass : process.env.SMTP_PASSWORD
        }
    })


   

    //create message which needs to send. 

    const message = {

        from : `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,  
        to: options.email, 
        subject : options.subject,
        text : options.message

  //to, subject, text are coming from controller
    }
//send email to user
    await transporter.sendMail(message); 
}


module.exports = sendEmail;