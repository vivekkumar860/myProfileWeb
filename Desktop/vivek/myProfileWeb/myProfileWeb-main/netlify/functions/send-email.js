const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Parse the request body
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body' })
    };
  }

  // Validate required fields
  const { from_name, from_email, subject, message } = data;
  if (!from_name || !from_email || !subject || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Please fill in all fields' })
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(from_email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid email address' })
    };
  }

  // Create Nodemailer transporter
  // You'll need to set these environment variables in Netlify
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use gmail or any other service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    }
  });

  // Alternative: Using custom SMTP (recommended for production)
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT || 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS
  //   }
  // });

  // Email options
  const mailOptions = {
    from: `"${from_name}" <${process.env.EMAIL_USER}>`,
    to: 'vivekkumarorigional@gmail.com', // Your receiving email
    replyTo: from_email,
    subject: `Portfolio Contact: ${subject}`,
    text: message,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h2 style="color: #4F46E5;">New Contact Form Submission</h2>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">

        <p><strong>Name:</strong> ${from_name}</p>
        <p><strong>Email:</strong> ${from_email}</p>
        <p><strong>Subject:</strong> ${subject}</p>

        <h3 style="color: #4F46E5; margin-top: 20px;">Message:</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
${message}
        </div>

        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This email was sent from your portfolio website contact form.
        </p>
      </div>
    `
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully!'
      })
    };
  } catch (error) {
    console.error('Email error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};