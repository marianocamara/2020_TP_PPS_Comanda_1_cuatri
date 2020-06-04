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
    const snapshot = change.after.data();
  
    if (snapshot.approved === false) {
      return null;
    }
  
    const mailOptions = {
      from: '"El equipo de Morfy" <morfy.app@gmail.com>',
      to: snapshot.email,
    };
  
    const approved = snapshot.approved;
  
    // Building Email message.
    mailOptions.subject = approved ? 'Te damos la bienvenida a Morfy' : 'Tu solicitud de registro fue denegada';
    mailOptions.text = approved ?
        '¡Hola ' + snapshot.name +  '!\nGracias por registrarte a traves de nuestra aplicación. \nTu solicitud ha sido aprobada, ya puedes ingresar y difrutar de todos nuestros productos.\n \nNos vemos pronto.' :
        'Lamentablemente tu solicitud de registro ha sido rechazada.';
    
    try {
      await mailTransport.sendMail(mailOptions);
      console.log(`New ${approved ? '' : 'un'}subscription confirmation email sent to:`, snapshot.email);
    } catch(error) {
      console.error('There was an error while sending the email:', error);
    }
    return null;
  });