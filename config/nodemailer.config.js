const nodemailer = require('nodemailer');

const user = process.env.NM_USER;

const transport = nodemailer.createTransport(
	{
		service: 'Gmail',
		auth: {
			user: user,
			pass: process.env.NM_PASS
		}
	}
)

module.exports.sendValidationEmail = (email, activationToken, name) => {
	transport.sendMail({
		to: email,
		from: `Latin dance app`,
		subject: 'Please activate your account here',
		html: `
			<h1>Hi ${name},</h1>
            <p>Please click on the button below to activate your account:</p>
            <div style="
                text-align: center;
                height: 150px;
                margin-top: 2rem;
                ">
                <a href="http://localhost:3001/activation/${activationToken}" 
                    style="
                        padding: 15px; 
                        color: white; 
                        background-color: #6c757d; 
                        border-radius: 5px;
                    ">
                    activate now
                </a>
            </div>
		`
	})
}
