# Dossiera: AI-Powered Talent Intelligence Platform 🎯

Dossiera is a production-ready Applicant Tracking System (ATS) optimization tool that uses **Generative AI** to analyze, score, and summarize resumes against specific job roles. Designed for modern recruiters who need to find the perfect fit in seconds.

![Banner](https://images.unsplash.com/photo-1454165833767-027ffea7025c?auto=format&fit=crop&q=80&w=1200)

## 🚀 Key Features
- **AI Match Scoring**: Instantly score resumes from 0-100% based on skill alignment.
- **Automated Skill Extraction**: Uses heuristic-based parsing to extract names, emails, and technologies.
- **Google Gemini Integration**: Provides deep AI insights for resume improvements and suitability summaries.
- **Automated Emailing**: Built-in **Nodemailer** integration to send professional interview or rejection emails directly to candidates.
- **Recruiter Dashboard**: Simple, intuitive management of multiple job roles and candidate pipelines.
- **Security First**: Protected by Google OAuth (NextAuth) and Zod data validation.

## 🛠️ Technology Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, ShadCN UI.
- **Backend**: Node.js, Next.js API Routes, Zod Validation, **Nodemailer**.
- **Database**: MongoDB Atlas (NoSQL).
- **Intelligence**: Google Gemini 1.5 Flash AI.
- **Authentication**: NextAuth.js (Google Provider).

## 📂 Architecture Overview
Dossiera follows a clean, decoupled architecture:
- **Client**: Responsive Single Page Application (SPA).
- **Server**: Standardized RESTful API layer with unified error handling.
- **Storage**: Cloud-hosted MongoDB and local file storage for resumes.


## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas Account
- Google Cloud Console (for OAuth)
- Gemini API Key

### Installation
1. **Clone the repo**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Dossiera.git
   cd Dossiera
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy `.env.example` to `.env.local` and add your secret keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📜 License
Protected under the **MIT License**. Created by **Rishika Pawar** (2026).

---
*Built with ❤️ as a Final year computer science engineering Project.*
