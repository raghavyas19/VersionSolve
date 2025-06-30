const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function getOtpEmailHtml(otp) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://versionsolve.xyz';
  return `
  <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f4f8fb; font-family: 'Segoe UI', Arial, sans-serif;">
    <tr>
      <td align="center" valign="middle" style="padding: 20px;">
        <table width="360" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 40px 30px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src='${frontendUrl}/Logo.png' alt='VersionSolve' style='width: 80px; margin-bottom: 20px;' />
              <h2 style="color: #1e3a8a; margin: 0; font-size: 1.6rem; font-weight: 700;">Verify Your Email</h2>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="color: #334155; font-size: 1rem; line-height: 1.5; text-align: center; margin-bottom: 24px;">Thank you for signing up for <b>VersionSolve</b>!<br />Enter the OTP below to complete your registration.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="background: #f1f5f9; border-radius: 8px; padding: 16px 24px; display: inline-block;">
                <span style="font-size: 2rem; letter-spacing: 0.5rem; color: #1e3a8a; font-weight: bold;">${otp}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="color: #64748b; font-size: 0.9rem; text-align: center;">This OTP is valid for <b>5 minutes</b>.<br>If you did not request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #94a3b8; font-size: 0.8rem;">&copy; ${new Date().getFullYear()} VersionSolve.xyz</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
}

async function sendEmail({ to, subject, html, otp }) {
  try {
    const emailHtml = otp ? getOtpEmailHtml(otp) : html;
    const data = await resend.emails.send({
      from: 'no-reply@versionsolve.xyz',
      to,
      subject,
      html: emailHtml,
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = sendEmail; 