
export interface ExpenseItem {
  id: string;
  title: string;
  amount: string;
  imageUrl: string;
  date: string; // เก็บวันที่แบบ ISO String (เช่น 2023-10-25T14:30:00.000Z)
  type: string; // เก็บประเภท (เช่น 'bus', 'moto', 'grab', 'other') เพื่อเอาไปแยกสี
}