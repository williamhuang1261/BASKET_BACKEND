import nodemailer from "nodemailer";
import config from "config";

const main = async (
  to: string,
  subject: string,
  body: string | Buffer | undefined
) => {
  const email: string = config.get("email");
  const email_password: string = config.get("email_password");

  if (!email || !email_password) return undefined;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass: email_password },
  });

  try {
    const info = await transporter.sendMail({
      from: email,
      to: to,
      subject: subject,
      html: body,
    });
    return info;
  } catch (ex) {
    return undefined;
  }
};

export default main;
