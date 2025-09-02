import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { email, alerts } = await req.json();

    if (!email || !alerts || alerts.length === 0) {
      return NextResponse.json(
        { error: "Missing email or alerts" },
        { status: 400 }
      );
    }

    // Configure SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // e.g. smtp.gmail.com
      port: parseInt("587"),
      secure: false, // true if using 465
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Build HTML email
    const alertRows = alerts
      .map(
        (a: { zone: string; status: string; timestamp: string }) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${a.zone}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${a.status}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">
          ${new Date(a.timestamp).toUTCString()}
        </td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background: #0ea5e9; color: white; padding: 16px; font-size: 18px; font-weight: bold;">
      🚨 New Cold Storage Alerts
    </div>
    <div style="padding: 16px;">
      <p>Hello,</p>
      <p>The following new alerts were detected in your cold storage monitoring system today:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Zone</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Status</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${alertRows}
        </tbody>
      </table>
      <p style="margin-top: 16px;">Please take necessary action to resolve these issues.</p>
      <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
        — Cold Storage Monitoring System
      </p>
    </div>
  </div>
`;

    // Send email
    await transporter.sendMail({
      from: `"Cold Storage Alerts" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "🚨 New Cold Storage Alerts Detected",
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: "Alert email sent" });
  } catch (err: any) {
    console.error("Email send error:", err);
    return NextResponse.json(
      { error: "Failed to send email", detail: err.message },
      { status: 500 }
    );
  }
}
