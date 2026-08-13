"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser } from "./auth.service";

//interfaces
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: "cash" | "cashless";
  initial_balance: number;
  current_balance: number;
  created_at: string;
  updated_at?: string;
}
interface CreateAccountInput {
  name: string;
  type: "cash" | "cashless";
  initial_balance: number;
}
interface GetAccountsParams {
  search?: string;
  type?: string;
  page?: number;
  itemsPerPage?: number;
}
interface UpdateAccountInput {
  name?: string;
  type?: "cash" | "cashless";
}

//CREATE ACCOUNTS
export async function createAccount(input: CreateAccountInput) {
  const supabase = await createClient();

  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const { name, type, initial_balance } = input;

  //validate
  if (!name || name.length < 3 || name.length > 100) {
    return { error: "Nama akun harus 3-100 karakter" };
  }
  if (type !== "cash" && type !== "cashless") {
    return { error: "Tipe akun tidak valid" };
  }
  if (typeof initial_balance !== "number" || isNaN(initial_balance)) {
    return { error: "Saldo awal tidak valid" };
  }

  //insert
  const { error } = await supabase.from("accounts").insert({
    name,
    type,
    initial_balance,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/app/settings/akun-keuangan");
}

//GET ACCOUNTS
export async function getAccounts(params: GetAccountsParams) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { search = "", type = "semua", page = 1, itemsPerPage = 5 } = params;

  let query = supabase
    .from("accounts_with_balance")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("name", `%${search}%`);
  if (type !== "semua") query = query.eq("type", type);

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const { data: accounts, count, error } = await query.range(from, to);

  if (error) return { error: error.message };

  return {
    accounts: accounts ?? [],
    totalCount: count ?? 0,
  };
}

//GET SUMMARY
export async function getAccountSummary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [cashResult, cashlessResult] = await Promise.all([
    supabase
      .from("accounts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "cash"),
    supabase
      .from("accounts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "cashless"),
  ]);

  return {
    cashCount: cashResult.count ?? 0,
    cashlessCount: cashlessResult.count ?? 0,
  };
}

//GET ACCOUNT BY ID
export async function getAccountById(id: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("accounts_with_balance") 
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return { error: error.message };
  return { account: data as Account };
}

//UPDATE ACCOUNT
export async function updateAccount(id: string, input: UpdateAccountInput) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  if (input.name !== undefined && (input.name.length < 3 || input.name.length > 100)) {
    return { error: "Nama akun harus 3-100 karakter" };
  }
  if (input.type !== undefined && input.type !== "cash" && input.type !== "cashless") {
    return { error: "Tipe akun tidak valid" };
  }

  const { error } = await supabase
    .from("accounts")
    .update({ ...input })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

//DELETE ACCOUNT
export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}