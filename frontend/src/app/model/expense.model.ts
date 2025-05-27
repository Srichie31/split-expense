export class Expense {
  expense_id?: string; // optional, backend can assign
  description: string;
  amount: number;
  expense_date: string;
  paidBy: string;
  group_id: string;
  splitBetween: string[];

  constructor(
    description: string,
    amount: number,
    expense_date: string,
    paidBy: string,
    group_id: string,
    splitBetween: string[]
  ) {
    this.description = description;
    this.amount = amount;
    this.expense_date = expense_date;
    this.paidBy = paidBy;
    this.group_id = group_id;
    this.splitBetween = splitBetween;
  }
}
