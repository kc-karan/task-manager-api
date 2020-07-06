const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_KEY);

const sendWelcomeEmail = (email, name) => {
    console.log('Sending mail');
    sgMail.send({
        to: email,
        from: 'kc02072000@gmail.com',
        subject: `Welcome ${name}`,
        text:  `Welcome to the app ${name}. Let me know how you get along`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kc02072000@gmail.com',
        subject: `Sorry to see you go ${name}`,
        text: 'Hoping to see you sometime soon'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}
