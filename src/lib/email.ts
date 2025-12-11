/**
 * Email configuration and templates for LandSale.lk
 * 
 * This module provides email sending functionality using Resend.
 * To enable email notifications:
 * 1. Sign up at resend.com
 * 2. Get your API key
 * 3. Add RESEND_API_KEY to your .env.local
 * 4. Verify your domain or use the sandbox for testing
 */

export interface EmailPayload {
    to: string
    subject: string
    html: string
    text?: string
}

export interface InquiryEmailData {
    sellerName: string
    sellerEmail: string
    buyerName: string
    buyerEmail?: string
    buyerPhone?: string
    propertyTitle: string
    propertyId: string
    message: string
}

/**
 * Send an email using Resend API
 * Returns true if successful, false otherwise (silently fails if not configured)
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        console.log('[Email] RESEND_API_KEY not configured - email not sent')
        return false
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'LandSale.lk <notifications@landsale.lk>',
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                text: payload.text,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('[Email] Failed to send:', error)
            return false
        }

        console.log('[Email] Sent successfully to:', payload.to)
        return true
    } catch (error) {
        console.error('[Email] Error sending email:', error)
        return false
    }
}

/**
 * Generate inquiry notification email for seller
 */
export function generateInquiryEmail(data: InquiryEmailData): EmailPayload {
    const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://landsale.lk'}/properties/${data.propertyId}`
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://landsale.lk'}/dashboard/inquiries`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry - LandSale.lk</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                    🏠 LandSale.lk
                </h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 32px;">
                <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">
                    New Inquiry for Your Property
                </h2>
                
                <p style="color: #64748b; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    Hi ${data.sellerName || 'there'},
                </p>
                
                <p style="color: #475569; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    Someone is interested in your property <strong>"${data.propertyTitle}"</strong> on LandSale.lk!
                </p>
                
                <!-- Buyer Details Box -->
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                    <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 16px;">
                        📧 Buyer Details
                    </h3>
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Name:</td>
                            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.buyerName}</td>
                        </tr>
                        ${data.buyerEmail ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                            <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                                <a href="mailto:${data.buyerEmail}" style="color: #059669;">${data.buyerEmail}</a>
                            </td>
                        </tr>
                        ` : ''}
                        ${data.buyerPhone ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone:</td>
                            <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                                <a href="tel:${data.buyerPhone}" style="color: #059669;">${data.buyerPhone}</a>
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                <!-- Message Box -->
                <div style="background-color: #ecfdf5; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #059669;">
                    <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px;">
                        💬 Message
                    </h3>
                    <p style="color: #1e293b; margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                </div>
                
                <!-- CTA Buttons -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 8px;">
                            <a href="${dashboardUrl}" style="display: block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-size: 16px; font-weight: 500; text-align: center;">
                                View in Dashboard
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;">
                            <a href="${propertyUrl}" style="display: block; background-color: #f1f5f9; color: #475569; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-size: 16px; font-weight: 500; text-align: center;">
                                View Property
                            </a>
                        </td>
                    </tr>
                </table>
                
                <p style="color: #94a3b8; margin: 24px 0 0 0; font-size: 14px; line-height: 1.6;">
                    Tip: Respond to inquiries within 24 hours to improve your conversion rate!
                </p>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 13px;">
                    This email was sent by LandSale.lk
                </p>
                <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                    Sri Lanka's Trusted Real Estate Marketplace
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`

    const text = `
New Inquiry for Your Property

Hi ${data.sellerName || 'there'},

Someone is interested in your property "${data.propertyTitle}" on LandSale.lk!

Buyer Details:
- Name: ${data.buyerName}
${data.buyerEmail ? `- Email: ${data.buyerEmail}` : ''}
${data.buyerPhone ? `- Phone: ${data.buyerPhone}` : ''}

Message:
${data.message}

View in Dashboard: ${dashboardUrl}
View Property: ${propertyUrl}

Tip: Respond to inquiries within 24 hours to improve your conversion rate!

---
LandSale.lk - Sri Lanka's Trusted Real Estate Marketplace
`

    return {
        to: data.sellerEmail,
        subject: `📩 New Inquiry: ${data.propertyTitle.slice(0, 50)}`,
        html,
        text
    }
}
