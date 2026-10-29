"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser } from "./auth.service";
import type {
  TransactionPurpose,
  TransactionPurposeFilter,
  Transaction,
} from "@/types/transaction";

//INTERFACES
export type GetTransactionsParams = {
  search?: string;
  purpose?: TransactionPurpose;
  page?: number;
  itemsPerPage?: number;
  categoryIds?: string[];
  accountIds?: string[];
  dateFrom?: string | null;
  dateTo?: string | null;
};

export type GetPeriodicParams = {
  search?: string;
  purpose?: TransactionPurposeFilter;
  limit?: number;
  cursor?: string;
  categoryIds?: string[];
  accountIds?: string[];
  dateFrom?: string | null;
  dateTo?: string | null;
};

interface TransactionEntryInput {
  account_id: string;
  amount: number;
}
interface CreateTransactionInput {
  purpose: "income" | "expense" | "account_transfer";
  category_id?: string | null;
  note?: string;
  transaction_date: string;
  transaction_time?: string | null;
  entries: TransactionEntryInput[];
  attachments?: File[];
}

interface UpdateTransactionInput {
  note?: string;
  transaction_date?: string;
  transaction_time?: string | null;
  category_id?: string | null;
}

//HELPER
async function resolveAccountFilterTxIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  accountIds: string[],
): Promise<{ txIds: string[] | null; error?: string }> {
  if (accountIds.length === 0) return { txIds: null };

  const { data, error } = await supabase
    .from("transaction_entries")
    .select("transaction_id")
    .in("account_id", accountIds);

  if (error) return { txIds: null, error: error.message };

  return { txIds: [...new Set((data || []).map((e) => e.transaction_id))] };
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
    categoryIds = [],
    accountIds = [],
    dateFrom = null,
    dateTo = null,
  } = params;

  const { txIds, error: accErr } = await resolveAccountFilterTxIds(
    supabase,
    accountIds,
  );
  if (accErr) return { error: accErr };
  if (txIds && txIds.length === 0) return { transactions: [], totalCount: 0 };

  let query = supabase
    .from("transactions")
    .select(
      `
        id, code, purpose, note, transaction_date, transaction_time, created_at, updated_at,
        categories ( name ),
        transaction_entries ( signed_amount )
      `,
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  if (search) {
    query = query.or(`note.ilike.%${search}%,code.ilike.%${search}%`);
  }
  if (purpose !== "semua") query = query.eq("purpose", purpose);
  if (categoryIds.length > 0) query = query.in("category_id", categoryIds);
  if (dateFrom) query = query.gte("transaction_date", dateFrom);
  if (dateTo) query = query.lte("transaction_date", dateTo);
  if (txIds) query = query.in("id", txIds);

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
    transaction_date: t.transaction_date,
    transaction_time: t.transaction_time,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));

  return { transactions, totalCount: count ?? 0 };
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

  const {
    search = "",
    purpose = "semua",
    limit = 20,
    cursor,
    categoryIds = [],
    accountIds = [],
    dateFrom = null,
    dateTo = null,
  } = params;

  const { txIds, error: accErr } = await resolveAccountFilterTxIds(
    supabase,
    accountIds,
  );
  if (accErr) return { error: accErr };
  if (txIds && txIds.length === 0) {
    return { transactions: [], hasMore: false, nextCursor: null };
  }

  let query = supabase
    .from("transactions")
    .select(
      `
        id, purpose, note, transaction_date, transaction_date, transaction_time,
        categories ( name ),
        transaction_entries ( signed_amount )
      `,
    )
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  if (search) {
    query = query.or(`note.ilike.%${search}%,code.ilike.%${search}%`);
  }
  if (purpose !== "semua") query = query.eq("purpose", purpose);
  if (categoryIds.length > 0) query = query.in("category_id", categoryIds);
  if (dateFrom) query = query.gte("transaction_date", dateFrom);
  if (dateTo) query = query.lte("transaction_date", dateTo);
  if (txIds) query = query.in("id", txIds);
  if (cursor) query = query.lt("transaction_date", cursor);

  const { data, error } = await query.limit(limit);
  if (error) return { error: error.message };

  const transactions: Transaction[] = (data || []).map((t: any) => ({
    id: t.id,
    purpose: t.purpose,
    category_name: t.categories?.name ?? null,
    note: t.note,
    amount: (t.transaction_entries || []).reduce(
      (sum: number, e: any) => sum + (e.signed_amount || 0),
      0,
    ),
    transaction_date: t.transaction_date,
    transaction_time: t.transaction_time,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));

  return {
    transactions,
    hasMore: (data?.length ?? 0) === limit,
    nextCursor: data?.length ? data[data.length - 1].transaction_date : null,
  };
}

//CATEGORY PICKER
export async function getCategoriesForPurpose(
  purpose: "income" | "expense",
  search?: string,
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
    .from("accounts_with_balance")
    .select("id, name, type, current_balance")
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

  const {
    purpose,
    category_id,
    note,
    transaction_date,
    transaction_time,
    entries,
    attachments,
  } = input;

  //validate
  // validate purpose
  if (
    !purpose ||
    !["income", "expense", "account_transfer"].includes(purpose)
  ) {
    return { error: "Tipe transaksi tidak valid" };
  }
  // validate note length
  if (note && note.length > 300) {
    return { error: "Keterangan maksimal 300 karakter" };
  }
  // validate date
  if (!transaction_date || !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)) {
    return { error: "Format tanggal tidak valid" };
  }
  if (isNaN(Date.parse(transaction_date))) {
    return { error: "Tanggal transaksi tidak valid" };
  }
  // validate time
  if (
    transaction_time !== undefined &&
    transaction_time !== null &&
    !/^\d{2}:\d{2}(:\d{2})?$/.test(transaction_time)
  ) {
    return { error: "Format waktu tidak valid" };
  }
  //validate entries is an array
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Minimal satu akun harus diisi" };
  }
  //validate each entry amount
  for (const entry of entries) {
    if (!entry.account_id) {
      return { error: "Akun harus dipilih" };
    }
    if (
      typeof entry.amount !== "number" ||
      isNaN(entry.amount) ||
      entry.amount <= 0
    ) {
      return { error: "Nominal harus lebih dari 0" };
    }
  }
  if (purpose === "account_transfer") {
    //exactly two entries
    if (entries.length !== 2) {
      return { error: "Relokasi membutuhkan akun sumber dan tujuan" };
    }
    //source and destination must be different
    if (entries[0].account_id === entries[1].account_id) {
      return { error: "Akun sumber dan tujuan harus berbeda" };
    }
    // category not allowed
    if (category_id) {
      return { error: "Relokasi tidak memerlukan kategori" };
    }
  } else {
    // income/expense
    if (entries.length === 0) {
      return { error: "Minimal satu akun harus diisi" };
    }
    //prevent duplicate account IDs in the same transaction
    const accountIds = entries.map((e) => e.account_id);
    if (new Set(accountIds).size !== accountIds.length) {
      return { error: "Akun tidak boleh duplikat dalam satu transaksi" };
    }
    //category is required
    if (!category_id) {
      return { error: "Kategori harus dipilih" };
    }
  }

  //signed entries
  const signedEntries = entries.map((e, index) => ({
    account_id: e.account_id,
    signed_amount:
      purpose === "income"
        ? Math.abs(e.amount)
        : purpose === "expense"
          ? -Math.abs(e.amount)
          : index === 0
            ? -Math.abs(e.amount)
            : Math.abs(e.amount),
  }));

  let createdTransactionId: string | null = null;
  const uploadedFilePaths: string[] = [];

  try {
    //insert transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        purpose,
        category_id: category_id || null,
        note: note || null,
        transaction_date,
        transaction_time: transaction_time ?? null,
      })
      .select("id")
      .single();

    if (txError) throw new Error(txError.message);
    createdTransactionId = transaction.id;

    //insert entries
    const { error: entriesError } = await supabase
      .from("transaction_entries")
      .insert(
        signedEntries.map((e) => ({
          transaction_id: createdTransactionId,
          account_id: e.account_id,
          signed_amount: e.signed_amount,
        })),
      );

    if (entriesError) throw new Error(entriesError.message);

    //insert attachments
    if (attachments && attachments.length > 0) {
      for (const [index, file] of attachments.entries()) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeFileName = `${createdTransactionId}-${Date.now()}-${index}.${ext}`;
        const filePath = `${user.id}/${createdTransactionId}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw new Error(uploadError.message);
        uploadedFilePaths.push(filePath);

        const { error: attachError } = await supabase
          .from("transaction_attachments")
          .insert({
            transaction_id: createdTransactionId,
            image_path: filePath,
          });

        if (attachError) throw new Error(attachError.message);
      }
    }

    return { success: true, transactionId: createdTransactionId };
  } catch (error: any) {
    if (createdTransactionId) {
      await supabase
        .from("transactions")
        .delete()
        .eq("id", createdTransactionId)
        .eq("user_id", user.id);
    }

    if (uploadedFilePaths.length > 0) {
      await supabase.storage.from("uploads").remove(uploadedFilePaths);
    }

    return { error: error.message || "Terjadi kesalahan" };
  }
}

//GET TRANSACTION BY ID
export async function getTransactionById(id: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id,
      code,
      purpose,
      note,
      transaction_date,
      transaction_time,
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
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return { error: error.message };

  //handle existing attachments
  if (data?.transaction_attachments) {
    data.transaction_attachments = await Promise.all(
      data.transaction_attachments.map(async (att: any) => {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("uploads")
          .createSignedUrl(att.image_path, 600);

        if (signedError) {
          console.error("Error creating signed URL:", signedError);
          return { ...att, image_url: null };
        }

        return { ...att, image_url: signedData.signedUrl };
      }),
    );
  }

  return { transaction: data };
}

// UPDATE TRANSACTION
export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  // ── validation ──
  if (input.note !== undefined && input.note.length > 300) {
    return { error: "Keterangan maksimal 300 karakter" };
  }

  if (input.transaction_date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.transaction_date)) {
      return { error: "Format tanggal tidak valid" };
    }
    if (isNaN(Date.parse(input.transaction_date))) {
      return { error: "Tanggal tidak valid" };
    }
  }

  if (
    input.transaction_time !== undefined &&
    input.transaction_time !== null
  ) {
    // accept "HH:MM" or "HH:MM:SS"
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(input.transaction_time)) {
      return { error: "Format waktu tidak valid" };
    }
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      note: input.note,
      transaction_date: input.transaction_date,
      transaction_time: input.transaction_time,
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

  //get attachments
  const { data: attachments, error: fetchAttachmentsError } = await supabase
    .from("transaction_attachments")
    .select("image_path")
    .eq("transaction_id", id);

  if (fetchAttachmentsError) {
    return { error: fetchAttachmentsError.message };
  }

  //delete transaction
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  //delete physical files
  if (attachments && attachments.length > 0) {
    const paths = attachments.map((att) => att.image_path);
    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove(paths);

    if (storageError) {
      console.error("Failed to delete storage files:", storageError.message);
    }
  }

  return { success: true };
}

//HELPER for transaction modal
export async function getAllCategoriesForFilter() {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, description")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) return { error: error.message };
  return { categories: data ?? [] };
}
export async function getAllAccountsForFilter() {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("accounts_with_balance")
    .select("id, name, type, current_balance")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) return { error: error.message };
  return { accounts: data ?? [] };
}