import type { Purpose } from "@/lib/utils/transaction.util";

export type Entry = {
  account_id: string;
  account_name: string;
  amount: string;
  account_type?: string;
};

export type Errors = Record<string, string>;

export interface FormContext {
  purpose: Purpose | null;
  note: string;
  transactionDate: string;
  transactionTime: string;
  useSpecificTime: boolean;
  categoryId: string | null;
  entries: Entry[];
}

const checkNote = (note: string): Errors =>
  note.trim() ? {} : { note: "Keterangan wajib diisi" };

const checkDate = (date: string): Errors =>
  date ? {} : { transactionDate: "Tanggal wajib diisi" };

const checkTime = (use: boolean, time: string): Errors =>
  use && !time ? { transactionTime: "Waktu wajib diisi" } : {};

const checkCategory = (id: string | null): Errors =>
  id ? {} : { category: "Pilih kategori" };

const checkTransferAccountsDiffer = (entries: Entry[]): Errors => {
  if (
    entries.length === 2 &&
    entries[0].account_id &&
    entries[1].account_id &&
    entries[0].account_id === entries[1].account_id
  ) {
    return {
      account_0: "Akun sumber tidak boleh sama dengan akun tujuan",
      account_1: "Akun tujuan tidak boleh sama dengan akun sumber",
    };
  }
  return {};
};

const checkTransferAmounts = (entries: Entry[]): Errors => {
  if (entries.length !== 2) return {};

  const source = parseFloat(entries[0].amount || "0");
  const dest = parseFloat(entries[1].amount || "0");

  if (!(source > 0) || !(dest > 0)) return {};

  if (dest > source) {
    return { amount_1: "Nominal tujuan tidak boleh melebihi nominal sumber" };
  }
  return {};
};

const checkEntry = (entry: Entry, i: number): Errors => {
  const e: Errors = {};
  if (!entry.account_id) e[`account_${i}`] = "Pilih akun";
  if (!entry.amount || parseFloat(entry.amount) <= 0)
    e[`amount_${i}`] = "Nominal harus > 0";
  return e;
};

const checkEntries = (entries: Entry[]): Errors => {
  const e: Errors = {};
  if (entries.length === 0) e.entries = "Minimal satu akun";
  entries.forEach((entry, i) => Object.assign(e, checkEntry(entry, i)));
  return e;
};

//public
export function validateAll(ctx: FormContext): Errors {
  if (!ctx.purpose) return { purpose: "Pilih tipe" };

  if (ctx.purpose === "account_transfer") {
    const e: Errors = {
      ...checkNote(ctx.note),
      ...checkDate(ctx.transactionDate),
      ...checkTime(ctx.useSpecificTime, ctx.transactionTime),
    };
    if (ctx.entries.length !== 2) e.entries = "Harus ada akun sumber & tujuan";
    ctx.entries.forEach((entry, i) => Object.assign(e, checkEntry(entry, i)));

    Object.assign(e, checkTransferAccountsDiffer(ctx.entries));
    Object.assign(e, checkTransferAmounts(ctx.entries));  

    return e;
  }

  return {
    ...checkNote(ctx.note),
    ...checkDate(ctx.transactionDate),
    ...checkTime(ctx.useSpecificTime, ctx.transactionTime),
    ...checkCategory(ctx.categoryId),
    ...checkEntries(ctx.entries),
  };
}

export function validateDesktopStep(ctx: FormContext, step: number): Errors {
  if (!ctx.purpose) return { purpose: "Pilih tipe" };
  if (step !== 1) return {};
  return validateAll(ctx);
}

export function validateMobileStep(ctx: FormContext, step: number): Errors {
  const e: Errors = {};
  if (step === 0 && !ctx.purpose) e.purpose = "Pilih salah satu tipe";
  if (step === 1) {
    if (ctx.purpose === "account_transfer") {
      Object.assign(e, checkEntry(ctx.entries[0] ?? ({} as Entry), 0));
    } else {
      Object.assign(e, checkNote(ctx.note));
      Object.assign(e, checkDate(ctx.transactionDate));
      Object.assign(e, checkTime(ctx.useSpecificTime, ctx.transactionTime));
      Object.assign(e, checkCategory(ctx.categoryId));
    }
  }
  if (step === 2) {
    if (ctx.purpose === "account_transfer") {
      Object.assign(e, checkEntry(ctx.entries[1] ?? ({} as Entry), 1));
      Object.assign(e, checkTransferAccountsDiffer(ctx.entries));
      Object.assign(e, checkTransferAmounts(ctx.entries)); 
    } else {
      Object.assign(e, checkEntries(ctx.entries));
    }
  }
  if (step === 3 && ctx.purpose === "account_transfer") {
    Object.assign(e, checkNote(ctx.note));
    Object.assign(e, checkDate(ctx.transactionDate));
    Object.assign(e, checkTime(ctx.useSpecificTime, ctx.transactionTime));
  }
  return e;
}
