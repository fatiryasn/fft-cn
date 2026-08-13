"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { enqueueSnackbar } from "notistack";
import { getCategoriesForPurpose } from "@/services/transaction.service";
import Spinner from "./Spinner";
import { getCategoryTypeBadge } from "@/lib/utils/category.util";

interface Category {
  id: string;
  name: string;
  description?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purpose: "income" | "expense" | null;
  onSelect: (categoryId: string, categoryName: string) => void;
}

export default function CategoryPicker({
  isOpen,
  onClose,
  purpose,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchList = useCallback(
    async (term: string) => {
      if (!purpose) return;
      setLoading(true);
      const result = await getCategoriesForPurpose(purpose, term);
      if ("error" in result) {
        enqueueSnackbar(result.error, { variant: "error" });
      } else {
        setList(result.categories || []);
      }
      setLoading(false);
    },
    [purpose]
  );

  useEffect(() => {
    if (isOpen && purpose) {
      setSearch("");
      fetchList("");
    }
  }, [isOpen, purpose, fetchList]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchList(value), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Pilih Kategori</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari kategori..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none border-gray-200"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {loading ? (
            <Spinner />
          ) : list.length === 0 ? (
            <p className="text-gray-500">Tidak ada kategori</p>
          ) : (
            list.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id, cat.name)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {cat.description ? cat.description.slice(0, 50) : ""}
                  </p>
                </div>
                {purpose && getCategoryTypeBadge(purpose, "text-xs")}
              </button>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </div>
  );
}