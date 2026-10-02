"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./auth.service";
import { redirect } from "next/navigation";

//UPDATE PROFILE
const PHONE_REGEX = /^62\d{9,15}$/;
export interface ResourceCounts {
  accountCount: number;
  incomeCategoryCount: number;
  expenseCategoryCount: number;
}

//GET PROFILE
export async function getProfileData() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error(error.message);

  const provider = user.app_metadata?.provider || "email";

  return {
    ...profile,
    email: user.email,
    provider,
  };
}

//GET USER RESOURCE COUNT
export async function getUserResourceCounts(): Promise<ResourceCounts> {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const [accountsRes, incomeRes, expenseRes] = await Promise.all([
    supabase
      .from("accounts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "income"),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "expense"),
  ]);

  return {
    accountCount: accountsRes.count ?? 0,
    incomeCategoryCount: incomeRes.count ?? 0,
    expenseCategoryCount: expenseRes.count ?? 0,
  };
}

//UPDATE PROFILE
export async function updateProfile(data: {
  full_name?: string;
  phone_number?: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  //validate
  const errors: Record<string, string> = {};

  //full name
  if (!data.full_name || data.full_name.trim().length === 0) {
    errors.full_name = "Nama lengkap wajib diisi";
  } else if (data.full_name.trim().length < 3) {
    errors.full_name = "Nama lengkap minimal 3 karakter";
  } else if (data.full_name.trim().length > 100) {
    errors.full_name = "Nama lengkap maksimal 100 karakter";
  }

  //phone number
  if (data.phone_number && data.phone_number.trim().length > 0) {
    if (!PHONE_REGEX.test(data.phone_number.trim())) {
      errors.phone_number =
        "Format nomor telepon tidak valid (contoh: 6281234567890)";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { error: "Validasi gagal", validationErrors: errors };
  }

  //update
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name?.trim(),
      phone_number: data.phone_number?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}