"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser } from "./auth.service";

//INTERFACES
export interface Transaction {
  id: string;
  purpose: "income" | "expense" | "account_transfer";
  category_name: string | null;
  note: string | null;
  amount: number;
  transaction_at: string;
  created_at: string;
  updated_at: string;
  code?: string;
}
interface GetTransactionsParams {
  search?: string;
  purpose?: string;
  page?: number;
  itemsPerPage?: number;
}
interface GetPeriodicParams {
  search?: string;
  purpose?: string;
  limit?: number;
  cursor?: string;
}
interface TransactionEntryInput {
  account_id: string;
  amount: number;
}
interface CreateTransactionInput {
  purpose: "income" | "expense" | "account_transfer";
  category_id?: string | null;
  note?: string;
  transaction_at: string;
  entries: TransactionEntryInput[];
  attachments?: File[];
}
interface UpdateTransactionInput {
  note?: string;
  transaction_at?: string;
  category_id?: string | null;
}


//GET TRANSACTIONS
export async function getTransactions(params: GetTransactionsParams) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const {
    search = "",
    purpose = "semua",
    page = 1,
    itemsPerPage = 30,
  } = params;

  let query = supabase
    .from("transactions")
    .select(
      `
        id,
        code,
        purpose,
        note,
        transaction_at,
        created_at,
        updated_at,
        categories ( name ),
        transaction_entries ( signed_amount )
      `,
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .order("transaction_at", { ascending: false });

  if (search) {
    query = query.or(
      `note.ilike.%${search}%, categories.name.ilike.%${search}%`,
    );
  }

  if (purpose !== "semua") {
    query = query.eq("purpose", purpose);
  }

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) return { error: error.message };

  const transactions: Transaction[] = (data || []).map((t: any) => ({
    id: t.id,
    code: t.code,
    purpose: t.purpose,
    category_name: t.categories?.name ?? null,
    note: t.note,
    amount: (t.transaction_entries || []).reduce(
      (sum: number, e: any) => sum + (e.signed_amount || 0),
      0,
    ),
    transaction_at: t.transaction_at,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));

  return {
    transactions,
    totalCount: count ?? 0,
  };
}

//GET TRANSACTION SUMMARY
export async function getTransactionSummary() {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  // Using a subquery to compute amount per transaction
  const { data, error } = await supabase.rpc("get_transaction_summary", {
    user_id_param: user.id,
  });

  if (error) {
    // fallback manual query
    const { data: t } = await supabase
      .from("transactions")
      .select(`purpose, transaction_entries ( signed_amount )`)
      .eq("user_id", user.id);

    const income = (t || [])
      .filter((tx: any) => tx.purpose === "income")
      .reduce((sum: number, tx: any) => {
        const amt = (tx.transaction_entries || []).reduce(
          (s: number, e: any) => s + (e.signed_amount || 0),
          0,
        );
        return sum + Math.abs(amt); // all incomes should be positive
      }, 0);

    const expense = (t || [])
      .filter((tx: any) => tx.purpose === "expense")
      .reduce((sum: number, tx: any) => {
        const amt = (tx.transaction_entries || []).reduce(
          (s: number, e: any) => s + (e.signed_amount || 0),
          0,
        );
        return sum + Math.abs(amt); // expenses are negative, take absolute
      }, 0);

    return { totalIncome: income, totalExpense: expense };
  }

  return data as { totalIncome: number; totalExpense: number };
}

//GET TRANSACTIONS (PERIODIC)
export async function getTransactionsPeriodic(params: GetPeriodicParams) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { search = "", purpose = "semua", limit = 20, cursor } = params;

  let query = supabase
    .from("transactions")
    .select(
      `
        id,
        purpose,
        note,
        transaction_at,
        categories ( name ),
        transaction_entries ( signed_amount )
      `,
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("transaction_at", { ascending: false });

  if (search) {
    query = query.or(`note.ilike.%${search}%, categories.name.ilike.%${search}%`);
  }
  if (purpose !== "semua") {
    query = query.eq("purpose", purpose);
  }
  if (cursor) {
    query = query.lt("transaction_at", cursor); // keyset pagination
  }

  const { data, count, error } = await query.limit(limit);

  if (error) return { error: error.message };

  const transactions: Transaction[] = (data || []).map((t: any) => ({
    id: t.id,
    purpose: t.purpose,
    category_name: t.categories?.name ?? null,
    note: t.note,
    amount: (t.transaction_entries || []).reduce(
      (sum: number, e: any) => sum + (e.signed_amount || 0),
      0
    ),
    transaction_at: t.transaction_at,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));

  return {
    transactions,
    hasMore: (data?.length ?? 0) === limit,
    nextCursor: data?.length ? data[data.length - 1].transaction_at : null,
  };
}

//CATEGORY PICKER
export async function getCategoriesForPurpose(
  purpose: "income" | "expense",
  search?: string
) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("categories")
    .select("id, name, description")
    .eq("user_id", user.id)
    .eq("type", purpose)
    .order("name", { ascending: true })
    .limit(10);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { categories: data ?? [] };
}

//ACCOUNT PICKER
export async function getAccountsForPicker(search?: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("name", { ascending: true })
    .limit(10);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { accounts: data ?? [] };
}

//CREATE TRANSACTION
export async function createTransaction(input: CreateTransactionInput) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { purpose, category_id, note, transaction_at, entries, attachments } = input;

  //validate
  if (!purpose || !["income", "expense", "account_transfer"].includes(purpose)) {
    return { error: "Tipe transaksi tidak valid" };
  }
  if (purpose !== "account_transfer" && entries.length === 0) {
    return { error: "Minimal satu akun harus diisi" };
  }
  if (purpose === "account_transfer" && entries.length !== 2) {
    return { error: "Relokasi membutuhkan akun sumber dan tujuan" };
  }

  //signed amount
  const signedEntries = entries.map((e) => ({
    account_id: e.account_id,
    signed_amount:
      purpose === "income"
        ? Math.abs(e.amount)
        : purpose === "expense"
        ? -Math.abs(e.amount)
        :
        entries.indexOf(e) === 0
        ? -Math.abs(e.amount)
        : Math.abs(e.amount),
  }));

  //insert
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      purpose,
      category_id: category_id || null,
      note: note || null,
      transaction_at,
    })
    .select("id")
    .single();

  if (txError) return { error: txError.message };

  const transactionId = transaction.id;

  // Insert entries
  const { error: entriesError } = await supabase.from("transaction_entries").insert(
    signedEntries.map((e) => ({
      transaction_id: transactionId,
      account_id: e.account_id,
      signed_amount: e.signed_amount,
    }))
  );
  if (entriesError) return { error: entriesError.message };

  //attachments
  if (attachments && attachments.length > 0) {
    const uploadPromises = attachments.map(async (file) => {
      const filePath = `${user.id}/${transactionId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { error: attachError } = await supabase
        .from("transaction_attachments")
        .insert({
          transaction_id: transactionId,
          image_path: filePath,
        });
      if (attachError) throw new Error(attachError.message);
    });

    try {
      await Promise.all(uploadPromises);
    } catch (err: any) {
      return { error: err.message };
    }
  }

  return { success: true, transactionId };
}

//GET TRANSACTION BY ID
export async function getTransactionById(id: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      code,
      purpose,
      note,
      transaction_at,
      created_at,
      updated_at,
      category_id,
      categories ( id, name ),
      transaction_entries (
        id,
        account_id,
        signed_amount,
        accounts ( id, name, type )
      ),
      transaction_attachments (
        id,
        image_path,
        created_at
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return { error: error.message };
  return { transaction: data };
}

//UPDATE TRANSACTION
export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  if (input.note !== undefined && input.note.length > 300) {
    return { error: "Keterangan maksimal 300 karakter" };
  }
  if (input.transaction_at && isNaN(Date.parse(input.transaction_at))) {
    return { error: "Tanggal tidak valid" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      note: input.note,
      transaction_at: input.transaction_at,
      category_id: input.category_id,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

//DELETE TRANSACTION
export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  // Also delete attachments from storage (optional, but we'll only delete DB records)
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}