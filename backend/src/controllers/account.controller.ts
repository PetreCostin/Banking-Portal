import { Response } from 'express';
import { body } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { generateAccountNumber } from '../utils/helpers';

export const accountValidators = {
  create: [
    body('accountType')
      .isIn(['CHECKING', 'SAVINGS', 'CREDIT_CARD'])
      .withMessage('Invalid account type'),
    body('currency').optional().isString(),
  ],
};

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      include: {
        cards: true,
      },
    });

    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

export const getAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        cards: true,
        fromTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        toTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ account });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { accountType, currency = 'USD' } = req.body;

    const accountNumber = generateAccountNumber();

    const account = await prisma.account.create({
      data: {
        accountNumber,
        accountType,
        currency,
        userId: req.userId!,
        balance: 0,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.userId!,
        type: 'ACCOUNT',
        title: 'New Account Created',
        message: `Your ${accountType} account has been created successfully.`,
      },
    });

    res.status(201).json({
      message: 'Account created successfully',
      account,
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const getAccountBalance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        currency: true,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ balance: account });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};
