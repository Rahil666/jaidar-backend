const dotenv = require('dotenv');
dotenv.config();

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.submitInquiry = async (req, res) => {
    console.log('--- New Inquiry Submission ---');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    try {
        const {
            fullName,
            phoneNumber,
            email,
            budget,
            location,
            propertyType,
            message,
        } = req.body;

        // Validation
        if (!fullName || !phoneNumber || !email) {
            return res.status(400).json({
                error: "Full name, phone number, and email are mandatory fields.",
            });
        }

        const emailContent = `
            <h2>New Property Inquiry</h2>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Phone Number:</strong> ${phoneNumber}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Budget:</strong> ${budget || "N/A"}</p>
            <p><strong>Location:</strong> ${location || "N/A"}</p>
            <p><strong>Property Type:</strong> ${propertyType || "N/A"}</p>
            <p><strong>Message:</strong><br/>${message || "No message provided."}</p>
        `;

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: process.env.NOTIFICATION_EMAIL || 'rahilramesh666@gmail.com',
            subject: `New Property Inquiry from ${fullName}`,
            html: emailContent,
        });

        if (error) {
            console.error('Resend Error (Admin):', error);
            return res.status(500).json({ error: 'Failed to send admin notification email.' });
        }

        // Send "Thank You" email to the customer
        const customerEmailContent = `
            <h2>Thank You for Your Inquiry</h2>
            <p>Dear ${fullName},</p>
            <p>Thank You for reaching out to Jaidar Real Estate. We have received your inquiry regarding <strong>${propertyType || 'one of our properties'}</strong> in <strong>${location || 'Dubai'}</strong>.</p>
            <p>Our team will review your details and connect with you soon.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Jaidar Real Estate Team</strong></p>
        `;

        const { error: customerError } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject: 'Thank You for Your Inquiry - Jaidar Real Estate',
            html: customerEmailContent,
        });

        if (customerError) {
            console.warn('Resend Error (Customer):', customerError);
            // We don't necessarily want to fail the whole request if only the customer email fails, 
            // but for now, let's keep it consistent.
        }

        res.status(200).json({ message: 'Inquiry submitted successfully and notification emails sent.', data });
    } catch (error) {
        console.error('Error in submitInquiry:', error.message);
        res.status(500).json({ error: 'Failed to submit inquiry.' });
    }
};