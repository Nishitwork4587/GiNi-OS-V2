'use server'
import { Client } from 'pg';
import { revalidatePath } from 'next/cache';

function getDbClient() {
  return new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// ==================== TASKS ====================
export async function fetchTasks() {
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM tasks ORDER BY id ASC');
    return JSON.parse(JSON.stringify(result.rows));
  } catch (error: any) { return []; } finally { await client.end(); }
}
export async function toggleTaskInDb(id: number, currentStatus: boolean) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('UPDATE tasks SET done = $1 WHERE id = $2', [!currentStatus, id]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function addTaskToDb(title: string, project: string, time: string, priority: string) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('INSERT INTO tasks (title, project, time, priority, done) VALUES ($1, $2, $3, $4, false)', [title, project, time, priority]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function updateTaskInDb(id: number, title: string, project: string) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('UPDATE tasks SET title = $1, project = $2 WHERE id = $3', [title, project, id]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function deleteTaskFromDb(id: number) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('DELETE FROM tasks WHERE id = $1', [id]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}

// ==================== EXPENSES ====================
export async function fetchExpenses() {
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM expenses ORDER BY date DESC, id DESC');
    return JSON.parse(JSON.stringify(result.rows));
  } catch (error: any) { return []; } finally { await client.end(); }
}
export async function addExpenseToDb(title: string, amount: number, category: string, date: string, vendor: string = '', paymentSource: string = 'BOB', transactionType: string = 'Expense', paymentType: string = 'Bank transfer') {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('INSERT INTO expenses (title, amount, category, date, vendor, payment_source, transaction_type, payment_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [title, amount, category, date, vendor, paymentSource, transactionType, paymentType]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function bulkAddExpenses(expensesList: any[]) {
  const client = getDbClient();
  try {
    await client.connect();
    for (const exp of expensesList) {
      await client.query('INSERT INTO expenses (title, amount, category, date, vendor, payment_source, transaction_type, payment_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [exp.title, exp.amount, exp.category, exp.date, exp.vendor || '', exp.paymentSource || 'BOB', exp.transactionType || 'Expense', exp.paymentType || 'Bank transfer']);
    }
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function deleteExpenseFromDb(id: number) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('DELETE FROM expenses WHERE id = $1', [id]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function clearAllExpensesFromDb() {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('DELETE FROM expenses');
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}

// ==================== HABITS ====================
export async function fetchHabits() {
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query(`
      SELECT h.*, COALESCE(json_agg(hl.completed_date) FILTER (WHERE hl.completed_date IS NOT NULL), '[]') as completed_dates
      FROM habits h LEFT JOIN habit_logs hl ON h.id = hl.habit_id GROUP BY h.id ORDER BY h.id ASC
    `);
    return JSON.parse(JSON.stringify(result.rows));
  } catch (error: any) { return []; } finally { await client.end(); }
}
export async function addHabitToDb(title: string, frequency: string = 'Daily') {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('INSERT INTO habits (title, frequency, streak, last_completed_date) VALUES ($1, $2, 0, $3)', [title, frequency, '']);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function toggleHabitDateInDb(habitId: number, dateStr: string, isDone: boolean) {
  const client = getDbClient();
  try {
    await client.connect();
    if (isDone) {
      await client.query('DELETE FROM habit_logs WHERE habit_id = $1 AND completed_date = $2', [habitId, dateStr]);
    } else {
      await client.query('INSERT INTO habit_logs (habit_id, completed_date) VALUES ($1, $2)', [habitId, dateStr]);
    }
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function completeHabitInDb(id: number, currentStreak: number, todayDate: string) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('UPDATE habits SET streak = $1, last_completed_date = $2 WHERE id = $3', [currentStreak + 1, todayDate, id]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}

// ==================== CALENDAR ====================
export async function fetchCalendarEvents() {
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM calendar_events ORDER BY start_time ASC');
    return JSON.parse(JSON.stringify(result.rows));
  } catch (error: any) { return []; } finally { await client.end(); }
}
export async function addCalendarEventToDb(title: string, eventDate: string, startTime: string, type: string, color: string) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('INSERT INTO calendar_events (title, event_date, start_time, type, color) VALUES ($1, $2, $3, $4, $5)', [title, eventDate, startTime, type, color]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function deleteCalendarEventFromDb(id: number) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('DELETE FROM calendar_events WHERE id = $1', [id]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}

// ==================== NOTES ====================
export async function fetchNotes() {
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM notes ORDER BY updated_at DESC');
    return JSON.parse(JSON.stringify(result.rows));
  } catch (error: any) { return []; } finally { await client.end(); }
}
export async function saveNoteToDb(id: number | null, title: string, content: string) {
  const client = getDbClient();
  try {
    await client.connect();
    if (id) {
      await client.query('UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [title, content, id]);
    } else {
      await client.query('INSERT INTO notes (title, content) VALUES ($1, $2)', [title, content]);
    }
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
export async function deleteNoteFromDb(id: number) {
  const client = getDbClient();
  try {
    await client.connect();
    await client.query('DELETE FROM notes WHERE id = $1', [id]);
    revalidatePath('/');
    return true;
  } catch (error: any) { return false; } finally { await client.end(); }
}
