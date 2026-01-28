import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { config } from '../config';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(
      parseInt(req.query.limit as string) || config.pagination.defaultPageSize,
      config.pagination.maxPageSize
    );
    const skip = (page - 1) * limit;

    const accountId = req.query.accountId as string;
    const type = req.query.type as string;

    const where: any = {
      OR: [
        { fromAccount: { userId: req.userId } },
        { toAccount: { userId: req.userId } },
      ],
    };

    if (accountId) {
      where.OR = [
        { fromAccountId: accountId },
        { toAccountId: accountId },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          fromAccount: {
            select: {
              accountNumber: true,
              accountType: true,
            },
          },
          toAccount: {
            select: {
              accountNumber: true,
              accountType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        OR: [
          { fromAccount: { userId: req.userId } },
          { toAccount: { userId: req.userId } },
        ],
      },
      include: {
        fromAccount: true,
        toAccount: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};
