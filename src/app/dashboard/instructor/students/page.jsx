"use client";
import React, { useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";

const STUDENTS = [
  { name: "Amna Tariq", date: "22 August 2025", courses: 3, city: "Lahore" },
  { name: "Mujtaba Rehman", date: "21 August 2025", courses: 1, city: "Karachi" },
  { name: "Esha Ahmed", date: "20 August 2025", courses: 3, city: "Lahore" },
  { name: "Alishba Faisal", date: "19 August 2025", courses: 3, city: "Islamabad" },
  { name: "Meerab Qaiser", date: "17 August 2025", courses: 10, city: "Lahore" },
  { name: "Areeba Fatima", date: "15 August 2025", courses: 5, city: "Quetta" },
  { name: "Maira Malik", date: "10 August 2025", courses: 11, city: "Lahore" },
  { name: "Eman Faqooq", date: "4 August 2025", courses: 3, city: "Lahore" },
  { name: "Ali Khan", date: "1 August 2025", courses: 2, city: "Karachi" },
  { name: "Sara Ali", date: "28 July 2025", courses: 4, city: "Islamabad" },
  { name: "Hassan Raza", date: "25 July 2025", courses: 1, city: "Peshawar" },
  { name: "Nida Zafar", date: "20 July 2025", courses: 2, city: "Lahore" },
];

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const totalItems = STUDENTS.length;
  const rows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return STUDENTS.slice(start, start + itemsPerPage);
  }, [page]);

  return (
    <div className="mx-auto px-6 pb-6 bg-white">
      <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-6">Students</h1>

      <div className="border border-[var(--gray-100)] rounded-[10px] overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--gray-50)]">
              <th className="text-left py-4 px-6 text-sm text-[var(--gray-700)]">Name</th>
              <th className="text-left py-4 px-6 text-sm text-[var(--gray-700)]">Date</th>
              <th className="text-left py-4 px-6 text-sm text-[var(--gray-700)]">courses</th>
              <th className="text-left py-4 px-6 text-sm text-[var(--gray-700)]">City</th>
              <th className="py-4 px-6 text-sm text-[var(--gray-700)]"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, idx) => (
              <tr key={`${s.name}-${idx}`} className="border-t border-gray-200">
                <td className="py-4 px-6 text-[var(--gray-700)]">{s.name}</td>
                <td className="py-4 px-6 text-[var(--gray-600)]">{s.date}</td>
                <td className="py-4 px-6 text-[var(--gray-700)]">{s.courses}</td>
                <td className="py-4 px-6 text-[var(--gray-700)]">{s.city}</td>
                <td className="py-4 px-6 text-[var(--gray-500)]">✉️</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={page} onPageChange={setPage} />
      </div>
    </div>
  );
}