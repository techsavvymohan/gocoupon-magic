import nodemailer from "nodemailer";

const trans = nodemailer.createTransport({
  host: "mail.spacemail.com",
  port: 465,
  secure: true,
  auth: { user: "support@gocoupon.io", pass: "%p91dLmw" },
});

async function main() {
  try {
    const res = await trans.sendMail({
      from: '"GoCoupon Support" <support@gocoupon.io>',
      to: "support@gocoupon.io",
      replyTo: "visitor@example.com",
      subject: "Test Nodemailer via Spacemail",
      text: "Hello world testing",
    });
    console.log("Success:", res.messageId);
  } catch (e: any) {
    console.error("Error sending mail:", e.message);
  }
}

main();
