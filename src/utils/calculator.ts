import { DashboardMetrics, InterestPeriod, Person, PersonBalanceSummary, Transaction } from '../types';

export function formatRupee(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with Indian numbering system (lakhs/crores)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function calculatePersonBalance(
  personId: string,
  transactions: Transaction[],
  isSettled: boolean = false
): PersonBalanceSummary {
  let totalLent = 0;
  let totalReceived = 0;
  let totalBorrowed = 0;
  let totalRepaid = 0;
  let totalInterestAccrued = 0;
  let totalAdjustments = 0;

  const personTxs = transactions.filter((tx) => tx.personId === personId);

  for (const tx of personTxs) {
    const amount = Number(tx.amount) || 0;
    switch (tx.type) {
      case 'LEND':
        totalLent += amount;
        break;
      case 'PAYMENT_RECEIVED':
        totalReceived += amount;
        break;
      case 'BORROW':
        totalBorrowed += amount;
        break;
      case 'PAYMENT_MADE':
        totalRepaid += amount;
        break;
      case 'INTEREST':
        totalInterestAccrued += amount;
        break;
      case 'ADJUSTMENT':
        totalAdjustments += amount;
        break;
    }
  }

  // Outstanding (they owe me) = totalLent + totalInterestAccrued - totalReceived + totalAdjustments
  // Liability (I owe them) = totalBorrowed - totalRepaid
  const lendingSide = totalLent + totalInterestAccrued - totalReceived + totalAdjustments;
  const borrowingSide = totalBorrowed - totalRepaid;

  const net = lendingSide - borrowingSide;

  const outstandingOwedToUser = net > 0 ? net : 0;
  const liabilityOwedByUser = net < 0 ? Math.abs(net) : 0;

  return {
    personId,
    totalLent,
    totalReceived,
    totalBorrowed,
    totalRepaid,
    totalInterestAccrued,
    totalAdjustments,
    outstandingOwedToUser: isSettled ? 0 : outstandingOwedToUser,
    liabilityOwedByUser: isSettled ? 0 : liabilityOwedByUser,
    netBalance: isSettled ? 0 : net,
    isSettled,
  };
}

export function calculateDashboardMetrics(
  people: Person[],
  transactions: Transaction[]
): DashboardMetrics {
  let othersOweMe = 0;
  let iOweOthers = 0;
  let totalInterestEarned = 0;

  for (const person of people) {
    const summary = calculatePersonBalance(person.id, transactions, person.isSettled);
    if (!person.isSettled) {
      othersOweMe += summary.outstandingOwedToUser;
      iOweOthers += summary.liabilityOwedByUser;
      totalInterestEarned += summary.totalInterestAccrued;
    }
  }

  return {
    othersOweMe,
    iOweOthers,
    netBalance: othersOweMe - iOweOthers,
    totalInterestEarned,
  };
}

export function computeInterestAmount(
  principal: number,
  ratePercent: number,
  period: InterestPeriod,
  months: number = 1
): number {
  if (principal <= 0 || ratePercent <= 0) return 0;
  switch (period) {
    case 'MONTHLY':
      return Math.round(principal * (ratePercent / 100) * months);
    case 'YEARLY':
      return Math.round(principal * (ratePercent / 100) * (months / 12));
    case 'CUSTOM':
    case 'NONE':
    default:
      return Math.round(principal * (ratePercent / 100));
  }
}
