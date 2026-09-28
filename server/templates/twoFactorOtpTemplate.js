export const twoFactorOtpTemplate = (otp, name, expiryMinutes = 10) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td style="background-color: #005c2b; padding: 24px 28px; text-align: left;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">
                    Society Management System
                  </h1>
                  <p style="margin: 4px 0 0 0; color: #a7f3d0; font-size: 12px;">
                    Two-Factor Authentication Security
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 28px;">
                  <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 16px; font-weight: 700;">
                    Hi ${name || 'Resident'},
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                    We received a request to verify your identity. Please use the following One-Time Password (OTP) to complete your login:
                  </p>

                  <!-- OTP Display Box -->
                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 20px 0;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #15803d; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">
                      Your One-Time Password
                    </span>
                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; color: #005c2b; letter-spacing: 8px; display: inline-block;">
                      ${otp}
                    </span>
                  </div>

                  <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                    ⏱️ This code is valid for <strong>${expiryMinutes} minutes</strong>. Do not share this OTP with anyone.
                  </p>

                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 14px; border-radius: 4px; margin: 0 0 20px 0;">
                    <p style="margin: 0; color: #991b1b; font-size: 12px; line-height: 1.4;">
                      If you did not attempt to log in, please ignore this email or update your password immediately.
                    </p>
                  </div>

                  <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                    Best regards,<br>
                    <strong>SMS Security Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 14px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                    This is an automated security verification from the SMS Portal.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export default twoFactorOtpTemplate;