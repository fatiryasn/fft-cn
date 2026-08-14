"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

//LOGOUT
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

//LOGIN
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.code) {
      case "invalid_credentials":
        return {
          success: false,
          message: "Email atau password yang anda masukkan salah.",
        };

      case "email_not_confirmed":
        return {
          success: false,
          message: "Email anda belum diverifikasi.",
        };

      default:
        console.error(error);

        return {
          success: false,
          message: "Terjadi kesalahan saat login. Silakan coba lagi.",
        };
    }
  }

  return {
    success: true,
    message: "Login berhasil.",
  };
}

//get user cached
export const getUserCached = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});


//REQUIRE USER
export async function requireUser() {
  const user = await getUserCached();

  if (!user) {
    redirect("/");
  }
  return user;
}

//REQUIRE GUEST
export async function requireGuest() {
  const user = await getUserCached();

  if (user) {
    redirect("/app");
  }
}

//GET CURRENT PROFILE
export async function getCurrentProfile() {
  const user = await requireUser();

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  console.log({ ...profile, email: user.email });
  return {
    ...profile,
    email: user.email,
  };
}

//LOGIN WITH GOOGLE
export async function loginWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      message: "Gagal memulai login dengan Google. Silakan coba lagi.",
    };
  }

  if (data.url) {
    return {
      success: true,
      url: data.url,
    };
  }

  return {
    success: false,
    message: "Gagal mendapatkan URL login Google.",
  };
}
