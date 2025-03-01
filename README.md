# LetterLoop 📧

## Overview

LetterLoop is a collaborative newsletter and group communication platform designed to streamline group interactions, collect responses, and generate newsletters with ease.

### 🌟 Key Features

- **User Roles**: 
  - Coordinators can create loops, manage questions, and generate newsletters
  - Members can submit responses to questions
- **Question Management**: Create, share, and track questions across different loops
- **Newsletter Generation**: Automatically compile member responses into newsletters
- **Flexible Communication**: Customize loops, questions, and communication frequency

### 🛠 Tech Stack

- **Frontend**: Next.js 14
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **Validation**: Zod

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase Account

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/letterloop.git
cd letterloop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Create Default User (Optional)

```bash
node scripts/create-default-user.js
```

### 5. Run Development Server

```bash
npm run dev
```

## Default Test Account

- **Email**: admin@letterloop.test
- **Password**: password123
- **Role**: Coordinator

## Database Schema

### Users
- `id`: Unique identifier
- `email`: User email
- `name`: User's full name
- `role`: 'coordinator' or 'member'

### Loops
- `id`: Unique loop identifier
- `name`: Loop name
- `description`: Loop description
- `coordinator_id`: Creator's user ID
- `send_day`: Scheduled newsletter send day
- `grace_period_days`: Response submission window

### Questions
- `id`: Question identifier
- `text`: Question content
- `created_by`: User who created the question
- `is_public`: Visibility of the question

### Responses
- `id`: Response identifier
- `loop_question_id`: Associated question
- `user_id`: Respondent's ID
- `text`: Response content

## Deployment

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication
3. Configure database tables
4. Add RLS (Row Level Security) policies

### Vercel/Netlify Deployment
- Connect your GitHub repository
- Set environment variables
- Deploy automatically on push

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and create a Pull Request

## License

MIT License

## Support

For issues or questions, please [open an issue](https://github.com/yourusername/letterloop/issues)

---

Made with ❤️ by the LetterLoop Team
