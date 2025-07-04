

const mailSender = async ({to, subject, html, transporter}) => {
 
  const mailOptions = {
    from: process.env.MAIL,
    to: to,
    subject: subject,
    html:html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { message: "Success!" };
  } catch (err) {
    console.error("Error en el envío:", err);
    throw new Error(`Error: ${err}`);
  }
};

export default mailSender;