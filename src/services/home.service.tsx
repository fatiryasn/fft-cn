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


  // 1. Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Gagal memuat profil");
  }

  // 2. Total balance from view
  const { data: accounts, error: balanceError } = await supabase
    .from("accounts_with_balance")
    .select("current_balance")
    .eq("user_id", user.id);

  if (balanceError) {
    throw new Error("Gagal memuat saldo");
  }

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.current_balance ?? 0),
    0,
  );

  // 3. Fetch all transactions for the current month.
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const start = new Date(Date.UTC(year, month, 1));
  start.setUTCDate(start.getUTCDate() - 1);

  const end = new Date(Date.UTC(year, month + 1, 1));
  end.setUTCDate(end.getUTCDate() + 1);

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("purpose, transaction_at, transaction_entries(signed_amount)")
    .eq("user_id", user.id)
    .gte("transaction_at", startIso)
    .lt("transaction_at", endIso);

  if (txError) {
    throw new Error("Gagal memuat arus kas");
  }

  return {
    fullName: profile.full_name,
    totalBalance,
    transactions: (transactions || []) as TransactionForCashFlow[],
  };
}