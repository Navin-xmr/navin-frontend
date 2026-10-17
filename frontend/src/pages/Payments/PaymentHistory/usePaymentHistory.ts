import { useCallback, useEffect, useState } from "react";
import {
  settlementsApi,
  Settlement,
  SettlementStatus,
  SettlementDetail,
} from "@services/api/endpoints/settlements";

const ITEMS_PER_PAGE = 10;

export interface UsePaymentHistoryReturn {
  isLoading: boolean;
  error: string | null;
  filterStatus: SettlementStatus | "All";
  setFilterStatus: (status: SettlementStatus | "All") => void;
  sortOrder: "asc" | "desc";
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isModalOpen: boolean;
  selectedPayment: Settlement | null;
  selectedDetail: SettlementDetail | null;
  isModalLoading: boolean;
  payments: Settlement[];
  total: number;
  totalPages: number;
  itemsPerPage: number;
  reload: () => void;
  openPaymentDetail: (payment: Settlement) => Promise<void>;
  closeModal: () => void;
  handleSortToggle: () => void;
}

export function usePaymentHistory(): UsePaymentHistoryReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<SettlementStatus | "All">(
    "All",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Settlement | null>(
    null,
  );
  const [selectedDetail, setSelectedDetail] =
    useState<SettlementDetail | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [payments, setPayments] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    // Aborting in cleanup means a superseded request can never write its result.
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await settlementsApi.getSettlements(
          {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            status: filterStatus === "All" ? undefined : filterStatus,
            sortBy: "createdAt",
            sortOrder,
          },
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setPayments(res.data);
          setTotal(res.total);
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(
          e instanceof Error ? e.message : "Failed to load payment history",
        );
        setPayments([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [currentPage, filterStatus, sortOrder, reloadKey]);

  const openPaymentDetail = async (payment: Settlement): Promise<void> => {
    setSelectedPayment(payment);
    setSelectedDetail(null);
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const detail = await settlementsApi.getSettlementById(payment._id);
      setSelectedDetail(detail);
    } catch {
      // Keep modal open with the list-row data already shown
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setSelectedDetail(null);
  };

  // A new sort order restarts from the first page.
  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  return {
    isLoading,
    error,
    filterStatus,
    setFilterStatus,
    sortOrder,
    currentPage,
    setCurrentPage,
    isModalOpen,
    selectedPayment,
    selectedDetail,
    isModalLoading,
    payments,
    total,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    reload,
    openPaymentDetail,
    closeModal,
    handleSortToggle,
  };
}
