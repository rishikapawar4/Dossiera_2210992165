import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action, candidateEmail, candidateName, missingSkills, matchedSkills, jobTitle } = await req.json();

        if (!action || !candidateEmail || !candidateName || !jobTitle) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            return NextResponse.json({ error: "Email configuration is missing from environment variables." }, { status: 500 });
        }

        // 1. Generate Email Content Natively (Bypass Gemini to avoid Free Tier API Rate Limits)
        let emailBodyHtml = "";
        let subject = "";

        // Safely extract at most 2 skills to make the email read naturally without an AI
        const matchedText = matchedSkills && matchedSkills.length > 0 ? matchedSkills.slice(0, 2).join(' and ') : 'your technical stack';
        const missingText = missingSkills && missingSkills.length > 0 ? missingSkills.slice(0, 2).join(' and ') : 'our specific requirements';

        // Dynamically calculate a realistic interview date (3 days from now)
        const interviewDate = new Date();
        interviewDate.setDate(interviewDate.getDate() + 3);
        const dateStr = interviewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        if (action === "reject") {
            subject = `Update on your application for ${jobTitle} at Dossiera`;
            emailBodyHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Dear ${candidateName},</p>
                <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at Dossiera.</p>
                <p>After reviewing your application, while we were impressed by your background in ${matchedText}, we have decided to progress with candidates whose experience more closely aligns with our immediate requirements in ${missingText}.</p>
                <p>We appreciate the time you took to apply and wish you the best in your career search.</p>
                <br/>
                <p style="margin-bottom: 0;">Best regards,</p>
                <p style="font-weight: bold; margin-top: 5px;">The Dossiera Talent Team</p>
            </div>`;

        } else if (action === "interview") {
            subject = `Interview Invitation: ${jobTitle} at Dossiera`;
            emailBodyHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Dear ${candidateName},</p>
                <p>We are pleased to inform you that your resume has been shortlisted for the next stage of our hiring process.</p>
                <p>After reviewing your application, we would like to invite you to participate in an interview for the position of <strong>${jobTitle}</strong> at Dossiera. We were highly impressed with your qualifications in ${matchedText} and believe you could be a great fit for our team.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">Interview Details:</h3>
                    <ul style="margin-bottom: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;"><strong>Date:</strong> ${dateStr}</li>
                        <li style="margin-bottom: 8px;"><strong>Time:</strong> 10:30 AM EST</li>
                        <li style="margin-bottom: 8px;"><strong>Mode:</strong> Online Video Call</li>
                        <li style="margin-bottom: 0;"><strong>Location/Link:</strong> Google Meet (Link provided upon confirmation)</li>
                    </ul>
                </div>

                <p>Please confirm your availability by replying to this email. If the proposed schedule does not work for you, feel free to suggest an alternative time.</p>
                <p>We look forward to speaking with you and learning more about your experience.</p>
                <br/>
                <p style="margin-bottom: 0;">Best regards,</p>
                <p style="font-weight: bold; margin-top: 5px;">The Dossiera Talent Team</p>
            </div>`;
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // 2. Send Email Using Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: `"Dossiera" <${process.env.EMAIL_USER}>`,
            to: candidateEmail,
            subject: subject,
            html: emailBodyHtml
        };

        const info = await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "Email successfully deployed!", infoId: info.messageId });

    } catch (error: any) {
        console.error("Automated Email Error:", error);
        return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }
}
