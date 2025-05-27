export class Group {
  group_id: string;
  name: string;
  createdAt: Date;
  createdBy:string;
  total_expense: number;
  members: string[];

  constructor(name: string) {
    this.name = name;
    this.createdAt = new Date();
    this.total_expense = 0;
  }
}
