const emitter = require('../utils/eventEmitter.js');    
const emailService = require('../config/email.js');
emitter.on('sendEmail', async ({to, subject, text})=>{
    try {
        await emailService.sendMail(to,subject,text);
        console.log(`Email sent to ${to}`);

        
        
    } catch (err) {
        console.warn('Failed to send email:  ', err.message);
        
        
    }
});




