import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASSWORD,
  },
});

export default transporter;
