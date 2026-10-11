import { getCategorySummary } from "@/services/category.service";
import AddCategoryForm from "./_components/AddCategoryForm";

export default async function TambahKategoriPage() {
  const { incomeCount, expenseCount } = await getCategorySummary();
  const hasAnyCategory = incomeCount + expenseCount > 0;

  return <AddCategoryForm hasAnyCategory={hasAnyCategory} />;
}
