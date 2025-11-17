"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

interface RequestItem {
  _id: string;
  studentId: string;
  fullName: string;
  newImage?: string | null;
  note: string;
  status: string;
  type: string;
  createdAt: string;
}

export default function Dashboard() {
  const [data, setData] = useState<RequestItem[]>([]);
  const [filtered, setFiltered] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10); // số item / page

  const totalPages = Math.ceil(filtered.length / limit);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "approved":
        return "bg-green-600 text-white";
      case "rejected":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Load dữ liệu từ JSON mock
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard-mock.json");
      const json = await res.json();
      setData(json.data || []);
      setFiltered(json.data || []);
    } catch (e) {
      console.log(e);
      setData([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search + Filter
  useEffect(() => {
    if (!data.length) return;

    const s = search.trim().toLowerCase();

    const temp = data.filter((x) => {
      const idMatch = x.studentId?.toLowerCase().includes(s);
      const nameMatch = x.fullName?.toLowerCase().includes(s);
      const statusMatch = statusFilter === "all" ? true : x.status === statusFilter;
      return (idMatch || nameMatch) && statusMatch;
    });

    setFiltered(temp);
    setCurrentPage(1); // reset page khi search/filter
  }, [search, statusFilter, data]);

  // Dữ liệu hiển thị theo page
  const start = (currentPage - 1) * limit;
  const end = start + limit;
  const currentPageData = filtered.slice(start, end);

  return (
    <div className="relative min-h-screen w-full p-6 overflow-hidden">
      {/* Light background animate */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
            "linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fff7ed 100%)",
            "linear-gradient(135deg, #fed7aa 0%, #fff7ed 50%, #ffedd5 100%)",
            "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Dark background animate */}
      <motion.div
        className="absolute inset-0 hidden dark:block"
        animate={{
          background: [
            "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
            "linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)",
            "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent tracking-tight">
            Dashboard Yêu Cầu
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Danh sách yêu cầu cập nhật thông tin của sinh viên
          </p>
        </div>

        {/* FILTER BAR */}
        <Card className="max-w-4xl mx-auto mb-6 backdrop-blur bg-white/60 dark:bg-black/20">
          <CardContent className="flex flex-col sm:flex-row items-center gap-3 p-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm theo MSSV hoặc tên..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
            </div>

            <select
              className="border rounded-md px-3 py-2 dark:bg-gray-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Đang chờ</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </CardContent>
        </Card>

        {/* TABLE */}
        <div className="max-w-5xl mx-auto">
          <Card className="backdrop-blur bg-card/80">
            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-orange-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <th className="p-3 text-left">MSSV</th>
                        <th className="p-3 text-left">Họ tên</th>
                        <th className="p-3 text-left">Loại</th>
                        <th className="p-3 text-left">Ghi chú</th>
                        <th className="p-3 text-left">Ngày tạo</th>
                        <th className="p-3 text-center">Trạng thái</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentPageData.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-6 text-gray-500 dark:text-gray-400"
                          >
                            Không có yêu cầu phù hợp.
                          </td>
                        </tr>
                      )}

                      {currentPageData.map((item, index) => (
                        <tr
                          key={item._id}
                          className={`border-b dark:border-gray-800 ${
                            index % 2 === 0
                              ? "bg-white/60 dark:bg-gray-900/40"
                              : "bg-white/30 dark:bg-gray-900/20"
                          }`}
                        >
                          <td className="p-3 font-medium">{item.studentId}</td>
                          <td className="p-3">{item.fullName}</td>
                          <td className="p-3 capitalize">{item.type}</td>
                          <td className="p-3 max-w-xs truncate">{item.note}</td>
                          <td className="p-3">
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* PAGINATION */}
                  {filtered.length > limit && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1">
                        Page {currentPage} / {totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}