"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./auth.service";

export type TransactionForCashFlow = {
  purpose: string;
  transaction_at: string;
  transaction_entries: { signed_amount: number }[];
};

export type HomeData = {
  fullName: string;
  totalBalance: number;
  transactions: TransactionForCashFlow[];
};

export async function getHomeData(): Promise<HomeData> {
  const user = await requireUser();
  const supabase = await createClient();

  console.log("[HOME] Fetching data for user:", user.id);

  // 1. Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("[HOME] Profile error:", profileError);
    throw new Error("Gagal memuat profil");
  }
  console.log("[HOME] Profile:", profile);

  // 2. Total balance from view
  const { data: accounts, error: balanceError } = await supabase
    .from("accounts_with_balance")
    .select("current_balance");

  if (balanceError) {
    console.error("[HOME] Balance error:", balanceError);
    throw new Error("Gagal memuat saldo");
  }
  console.log("[HOME] Raw accounts (count):", accounts.length);
  console.log("[HOME] Accounts data (first 5):", accounts.slice(0, 5));

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.current_balance ?? 0),
    0,
  );
  console.log("[HOME] Total balance:", totalBalance);

  // 3. Fetch all transactions for the current month (no aggregation)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  console.log("[HOME] Cash flow range:", startOfMonth, "–", endOfMonth);

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("purpose, transaction_at, transaction_entries(signed_amount)")
    .eq("user_id", user.id)
    .gte("transaction_at", startOfMonth)
    .lte("transaction_at", endOfMonth);

  if (txError) {
    console.error("[HOME] Transactions error:", txError);
    throw new Error("Gagal memuat arus kas");
  }

  console.log("[HOME] Raw transactions count:", transactions?.length);
  console.log("[HOME] Transactions data (first 5):", transactions?.slice(0, 5));

  // Return the raw transactions, client will aggregate by local timezone
  return {
    fullName: profile.full_name,
    totalBalance,
    transactions: (transactions || []) as TransactionForCashFlow[],
  };
}
