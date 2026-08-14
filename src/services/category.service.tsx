"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser } from "./auth.service";

//INTERFACES
export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  description: string | null;
  created_at: string;
  updated_at?: string;
}
interface GetCategoriesParams {
  search?: string;
  type?: string;
  page?: number;
  itemsPerPage?: number;
}
interface CreateCategoryInput {
  name: string;
  type: "income" | "expense";
  description?: string;
}
interface UpdateCategoryInput {
  name?: string;
  type?: "income" | "expense";
  description?: string;
}

//GET CATEGORIES
export async function getCategories(params: GetCategoriesParams) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { search = "", type = "semua", page = 1, itemsPerPage = 5 } = params;

  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("name", `%${search}%`);
  if (type !== "semua") query = query.eq("type", type);

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const { data: categories, count, error } = await query.range(from, to);

  if (error) return { error: error.message };

  return {
    categories: categories ?? [],
    totalCount: count ?? 0,
  };
}

//GET CATEGORY SUMMARY
export async function getCategorySummary() {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const [incomeResult, expenseResult] = await Promise.all([
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
    incomeCount: incomeResult.count ?? 0,
    expenseCount: expenseResult.count ?? 0,
  };
}

//CREATE CATEGORY
export async function createCategory(input: CreateCategoryInput) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { name, type, description } = input;

  if (!name || name.length < 3 || name.length > 100) {
    return { error: "Nama kategori harus 3-100 karakter" };
  }
  if (type !== "income" && type !== "expense") {
    return { error: "Tipe kategori tidak valid" };
  }
  if (description && description.length > 300) {
    return { error: "Deskripsi maksimal 300 karakter" };
  }

  const { error } = await supabase.from("categories").insert({
    name,
    type,
    description: description || null,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, name };
}


//GET CATEGORY BY ID
export async function getCategoryById(id: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return { error: error.message };
  return { category: data as Category };
}

//UPDATE CATEGORY
export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  // Validate at least one field to update
  if (!input.name && !input.type && input.description === undefined) {
    return { error: "Tidak ada perubahan yang dikirim" };
  }
  if (input.name !== undefined && (input.name.length < 3 || input.name.length > 100)) {
    return { error: "Nama kategori harus 3-100 karakter" };
  }
  if (input.type !== undefined && input.type !== "income" && input.type !== "expense") {
    return { error: "Tipe kategori tidak valid" };
  }
  if (input.description !== undefined && input.description.length > 300) {
    return { error: "Deskripsi maksimal 300 karakter" };
  }

  const { error } = await supabase
    .from("categories")
    .update({ ...input })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

//DELETE CATEGORY
export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const user = await requireUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}