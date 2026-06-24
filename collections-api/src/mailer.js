const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetEmail(email, link) {

  await resend.emails.send({

    from: "onboarding@resend.dev",

    to: email,

    subject: "Reset your password",

    html: `
      <h2>Password reset</h2>

      <p>Click the link below to reset your password.</p>

      <a href="${link}">
        Reset password
      </a>
    `
  });

}

module.exports = {
  sendResetEmail
};
