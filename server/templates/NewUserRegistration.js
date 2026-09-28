export const newUserRegistrationTemplate = (password, name, email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SMS Portal</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #005c2b; padding: 28px 32px; text-align: left;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
                          Society Management System
                        </h1>
                        <p style="margin: 4px 0 0 0; color: #a7f3d0; font-size: 13px;">
                          Residential Community Access Portal
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                    Welcome, ${name || 'Resident'}!
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                    Your access request has been received and approved. You can now sign in to the SMS Portal using your temporary login credentials below:
                  </p>

                  <!-- Credentials Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 0 24px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Registered Email</span>
                              <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${email}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-top: 12px;">
                              <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Temporary Password</span>
                              <span style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; font-weight: 700; color: #005c2b; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 8px; letter-spacing: 0.08em;">
                                ${password}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Next Steps -->
                  <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">
                    Next Steps:
                  </h3>
                  <ol style="margin: 0 0 20px 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.7;">
                    <li>Navigate to the SMS Portal sign in page.</li>
                    <li>Sign in using your registered email and the temporary password above.</li>
                    <li>Complete the one-time OTP verification sent to your email.</li>
                    <li>Change your password from <strong>Profile Settings</strong> after your first login.</li>
                  </ol>

                  <!-- Security Warning -->
                  <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin: 0 0 24px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5;">
                      <strong>Security Notice:</strong> Do not share these temporary credentials with anyone. If you did not request access to the SMS Portal, please notify your society administrator immediately.
                    </p>
                  </div>

                  <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                    Best regards,<br>
                    <strong>SMS Management Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                    This is an automated system notification from the Society Management System.
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

export default newUserRegistrationTemplate;
