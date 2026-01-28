import { Response } from 'express';
import { body } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { generateTransactionReference } from '../utils/helpers';

export const transferValidators = {
  internal: [
    body('fromAccountId').isUUID().withMessage('Invalid from account ID'),
    body('toAccountId').isUUID().withMessage('Invalid to account ID'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('description').optional().isString(),
  ],
  external: [
    body('fromAccountId').isUUID().withMessage('Invalid from account ID'),
    body('beneficiaryId').isUUID().withMessage('Invalid beneficiary ID'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('description').optional().isString(),
  ],
};

export const internalTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    // Verify from account belongs to user
    const fromAccount = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: req.userId,
        status: 'ACTIVE',
      },
    });

    if (!fromAccount) {
      return res.status(404).json({ error: 'Source account not found' });
    }

    // Check sufficient balance
    if (Number(fromAccount.balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Verify to account exists
    const toAccount = await prisma.account.findUnique({
      where: { id: toAccountId },
    });

    if (!toAccount) {
      return res.status(404).json({ error: 'Destination account not found' });
    }

    // Perform transfer in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from source
      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });

      // Add to destination
      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          fromAccountId,
          toAccountId,
          fromUserId: req.userId,
          toUserId: toAccount.userId,
          amount,
          type: 'TRANSFER',
          status: 'COMPLETED',
          description,
          reference: generateTransactionReference(),
        },
      });

      // Create notification for sender
      await tx.notification.create({
        data: {
          userId: req.userId!,
          type: 'TRANSACTION',
          title: 'Transfer Completed',
          message: `Transfer of $${amount} completed successfully.`,
          metadata: { transactionId: transaction.id },
        },
      });

      // Create notification for receiver if different user
      if (toAccount.userId !== req.userId) {
        await tx.notification.create({
          data: {
            userId: toAccount.userId,
            type: 'TRANSACTION',
            title: 'Money Received',
            message: `You received $${amount}.`,
            metadata: { transactionId: transaction.id },
          },
        });
      }

      return transaction;
    });

    res.json({
      message: 'Transfer completed successfully',
      transaction: result,
    });
  } catch (error) {
    console.error('Internal transfer error:', error);
    res.status(500).json({ error: 'Transfer failed' });
  }
};

export const getTransferStatus = async (req: AuthRequest, res: Response) => {
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
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      status: transaction.status,
      transaction,
    });
  } catch (error) {
    console.error('Get transfer status error:', error);
    res.status(500).json({ error: 'Failed to fetch transfer status' });
  }
};
