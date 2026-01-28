import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create demo admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@banking.com' },
    update: {},
    create: {
      email: 'admin@banking.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isEmailVerified: true,
      phone: '+1234567890',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create demo customer user
  const customer = await prisma.user.upsert({
    where: { email: 'demo@banking.com' },
    update: {},
    create: {
      email: 'demo@banking.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'CUSTOMER',
      isEmailVerified: true,
      phone: '+1234567891',
    },
  });

  console.log('Created demo customer:', customer.email);

  // Create demo accounts for customer
  const checkingAccount = await prisma.account.create({
    data: {
      accountNumber: '1234567890',
      accountType: 'CHECKING',
      balance: 5000,
      currency: 'USD',
      status: 'ACTIVE',
      userId: customer.id,
    },
  });

  console.log('Created checking account:', checkingAccount.accountNumber);

  const savingsAccount = await prisma.account.create({
    data: {
      accountNumber: '1234567891',
      accountType: 'SAVINGS',
      balance: 10000,
      currency: 'USD',
      status: 'ACTIVE',
      userId: customer.id,
    },
  });

  console.log('Created savings account:', savingsAccount.accountNumber);

  // Create a sample transaction
  const transaction = await prisma.transaction.create({
    data: {
      fromAccountId: checkingAccount.id,
      toAccountId: savingsAccount.id,
      fromUserId: customer.id,
      toUserId: customer.id,
      amount: 100,
      type: 'TRANSFER',
      status: 'COMPLETED',
      description: 'Initial transfer',
      reference: 'TXN1234567890',
    },
  });

  console.log('Created sample transaction:', transaction.reference);

  // Create notification
  await prisma.notification.create({
    data: {
      userId: customer.id,
      type: 'ACCOUNT',
      title: 'Welcome to Banking Portal',
      message: 'Your account has been set up successfully!',
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
