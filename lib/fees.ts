export interface FeesSettings {
  courseFee: string;
  deadline: string;
  discountPercent: string;
  offeredAmount: string;
  paymentNo: string;
  mcqCourseFee: string;
  mcqDeadline: string;
  mcqDiscountPercent: string;
  mcqOfferedAmount: string;
  mcqPaymentNo: string;
  mcqCardVisible: boolean;
}

export const EMPTY_FEES: FeesSettings = {
  courseFee: "", deadline: "", discountPercent: "", offeredAmount: "", paymentNo: "",
  mcqCourseFee: "", mcqDeadline: "", mcqDiscountPercent: "", mcqOfferedAmount: "", mcqPaymentNo: "",
  mcqCardVisible: true,
};

/**
 * Resolves what a student actually owes: the discounted `offeredAmount` if
 * one is set AND today is on/before `deadline` (or no deadline is set),
 * otherwise the full `fee`. Mirrors the logic implied by FeesSettingsForm.
 */
export function resolveFee(fee: string, offeredAmount: string, deadline: string): number {
  const feeNum = Number(fee) || 0;
  if (!offeredAmount) return feeNum;

  if (deadline) {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (todayStr > deadline) return feeNum; // discount window passed
  }

  const offeredNum = Number(offeredAmount);
  return Number.isNaN(offeredNum) || offeredNum <= 0 ? feeNum : offeredNum;
}