"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./auth.service";

export type TransactionForCashFlow = {
  purpose: string;
  transaction_date: string;
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

  //PROFILE
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Gagal memuat profil");
  }

  //TOTAL BALANCE
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

  //CURRENT MONTH CASH FLOW
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const pad = (n: number) => String(n).padStart(2, "0");

  const startDate = `${year}-${pad(month + 1)}-01`;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const endDate = `${nextYear}-${pad(nextMonth + 1)}-01`;

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("purpose, transaction_date, transaction_entries(signed_amount)")
    .eq("user_id", user.id)
    .gte("transaction_date", startDate)
    .lt("transaction_date", endDate);

  if (txError) {
    throw new Error("Gagal memuat arus kas");
  }

  return {
    fullName: profile.full_name,
    totalBalance,
    transactions: (transactions || []) as TransactionForCashFlow[],
  };
}