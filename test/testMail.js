import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load biến môi trường từ .env

// Kiểm tra biến môi trường
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: `"Gửi thử nghiệm" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER, // Gửi cho chính mình để test
  subject: '✅ Gửi thành công từ testMail.js',
  html: `<p>Đây là email kiểm tra chức năng gửi mail trong chức năng quên mật khẩu.</p>`
};

transporter.sendMail(mailOptions)
  .then(info => {
    console.log('✅ Gửi thành công:', info.response);
  })
  .catch(error => {
    console.error('❌ Gửi thất bại:', error);
  });
