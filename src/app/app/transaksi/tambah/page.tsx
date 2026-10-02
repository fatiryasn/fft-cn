import { getUserResourceCounts } from "@/services/profile.service";
import TransactionForm from "./_components/TransactionForm";

export default async function Page() {
  const { accountCount, incomeCategoryCount, expenseCategoryCount } =
    await getUserResourceCounts();

  return (
    <TransactionForm
      accountCount={accountCount}
      incomeCategoryCount={incomeCategoryCount}
      expenseCategoryCount={expenseCategoryCount}
    />
  );
}
