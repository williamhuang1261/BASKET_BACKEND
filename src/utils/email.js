const nodemailer = require('nodemailer');
const config = require('config');

async function main(to, subject, body) {
  const email = config.get('email');
  const email_password = config.get('email_password');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {user: email, pass: email_password},
  });

  try{
    const info = await transporter.sendMail({
      from: email,
      to: to,
      subject: subject,
      html: body
    });
    return info
  }
  catch (ex){
    return undefined
  }
}

exports.sendEmail = main;