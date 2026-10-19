import type { TransactionMeta } from '@metamask/transaction-controller';
import type { Hex } from '@metamask/utils';

import type {
  QuoteRequest,
  TransactionPayControllerMessenger,
} from '../types.js';
import { resolveNonAtomicRecipient } from './second-leg.js';

/**
 * Resolve the quote recipient used by both Relay and Server.
 *
 * This is the single recipient decision point for quote construction:
 * non-atomic override recipient first, then any explicit request recipient,
 * then either the second-leg payer override or the transaction sender.
 *
 * @param options - Recipient resolution options.
 * @param options.messenger - Controller messenger.
 * @param options.request - Quote request.
 * @param options.secondLeg - Whether this quote is for the second leg.
 * @param options.transaction - Original transaction metadata.
 * @returns The recipient to use for the quote body.
 */
export async function resolveQuoteRecipient({
  messenger,
  request,
  secondLeg = false,
  transaction,
}: {
  messenger: TransactionPayControllerMessenger;
  request: QuoteRequest;
  secondLeg?: boolean;
  transaction: TransactionMeta;
}): Promise<Hex> {
  const nonAtomicRecipient = await resolveNonAtomicRecipient(
    transaction,
    request,
    messenger,
  );

  const fallbackRecipient = secondLeg
    ? (request.from as Hex | undefined) ??
      (transaction.txParams.from as Hex | undefined)
    : (transaction.txParams.from as Hex | undefined) ?? (request.from as Hex);

  return nonAtomicRecipient ?? request.recipient ?? fallbackRecipient;
}
