const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = async (email, name) => {
  try {
    await sgMail.send({
      to: email,
      from: 'ferdi.kurt111@gmail.com',
      subject: 'Welcome to the application!',
      text: `Welcome to the application ${name}. Enjoy it :)`,
    })
  } catch (err) {
    throw new Error(err)
  }
}

const cancelationEmail = async (email, name) => {
  try {
    await sgMail.send({
      to: email,
      from: 'ferdi.kurt111@gmail.com',
      subject: 'Cancelation Reason!',
      text: `Why you ${name} leave the application.`,
    })
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  sendWelcomeEmail,
  cancelationEmail,
}
