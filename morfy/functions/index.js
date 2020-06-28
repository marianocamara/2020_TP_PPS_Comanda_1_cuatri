const functions = require('firebase-functions')
const admin=require('firebase-admin');
const nodemailer =require('nodemailer');
admin.initializeApp()
require('dotenv').config()

const {SENDER_EMAIL,SENDER_PASSWORD}= process.env;

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD,
  },
});

// Sends an email confirmation when a supervisor approves a user registration petition.
exports.sendEmailConfirmationOnApproval = functions.firestore.document('/users/{uid}').onWrite(async (change) => {
  const newValue  = change.after.data();
  const previousValue  = change.before.data();
  
  if (newValue.approved === false || previousValue.approved === newValue.approved) {
    return null;
  }else{
    const mailOptions = {
      from: '"El equipo de Morfy" <morfy.app@gmail.com>',
      to: newValue.email,
    };
    
    const approved = newValue.approved;
    
    // Building Email message.
    mailOptions.subject = approved ? 'Te damos la bienvenida a Morfy' : 'Tu solicitud de registro fue denegada';
    mailOptions.text = approved ?
    '¡Hola ' + newValue.name +  '!\nGracias por registrarte a traves de nuestra aplicación. \nTu solicitud ha sido aprobada, ya puedes ingresar y difrutar de todos nuestros productos.\n \nNos vemos pronto.' :
    'Lamentablemente tu solicitud de registro ha sido rechazada.';
    
    try {
      await mailTransport.sendMail(mailOptions);
      console.log(`New ${approved ? '' : 'un'}subscription confirmation email sent to:`, newValue.email);
    } catch(error) {
      console.error('There was an error while sending the email:', error);
    }
    return null;
  }
});