#!/bin/bash

echo "🚀 Setting up Process Monitor SaaS..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your credentials."
    echo ""
else
    echo "✅ .env file already exists."
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Start Docker containers
echo "🐳 Starting Docker containers (PostgreSQL + Redis)..."
npm run docker:dev
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate
echo ""

# Seed database
echo "🌱 Seeding database with initial data..."
npm run prisma:seed
echo ""

echo "✨ Setup completed successfully!"
echo ""
echo "📚 Next steps:"
echo "  1. Update your .env file with real credentials (SMTP, OAuth, etc.)"
echo "  2. Run 'npm run start:dev' to start the development server"
echo "  3. Access http://localhost:3000/api/health to verify"
echo "  4. Access http://localhost:5555 to open Prisma Studio"
echo "  5. Access http://localhost:3001 to monitor BullMQ queues"
echo ""
echo "Happy coding! 🎉"
