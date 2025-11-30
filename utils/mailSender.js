const nodeMailer = require("nodemailer")

const mailSender = async (EmailAddress, title, body) => {
    try {
        const auth = {
            user: process.env.GMAILID,
            pass: process.env.GMAILPASSWORD,
        };
        const transportOptions = {
            host: "smtp.gmail.com",
            port: "587",
            auth,
            requireTLS: true,
            secureConnection: false,
            tls: { ciphers: "SSLv3" },
        };

        const transporter = nodeMailer.createTransport(transportOptions)
        let info = await transporter.sendMail({
            from: process.env.GMAILID,
            to: EmailAddress,
            subject: title,
            html: body
        })
        console.log("Email sent successfully.")
        return info
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender