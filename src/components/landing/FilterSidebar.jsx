"use client";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MdFilterList } from "react-icons/md";

// Controlled filter sidebar. Parent should pass availableCategories, selectedCategories, onToggleCategory,
// selectedPrice ("all"|"free"|"paid"), onChangePrice, selectedRating (number|null), onChangeRating
export default function FilterSidebar({
  availableCategories = [],
  selectedCategories = new Set(),
  onToggleCategory = () => {},
  selectedPrice = "all",
  onChangePrice = () => {},
  selectedRating = null,
  onChangeRating = () => {},
  onClear = null,
  categoryTitle = "Categories",
  priceTitle = "Price",
  priceOptions = [
    { key: "all", label: "All" },
    { key: "free", label: "Free" },
    { key: "paid", label: "Paid" },
  ],
  ratingTitle = "Reviews",
  ratingOptions = [5, 4, 3, 2, 1],
  levelTitle = "Level",
  levelOptions = [
    { key: "all", label: "All" },
    { key: "beginner", label: "Beginner" },
    { key: "advance", label: "Advance" },
    { key: "expert", label: "Expert" },
  ],
  selectedLevel = "all",
  onChangeLevel = () => {},
}) {
  const [open, setOpen] = useState({
    categories: true,
    price: true,
    range: false,
    reviews: true,
    level: true,
  });

  const categoryLabels = useMemo(() => {
    if (availableCategories.length) return availableCategories;
    return [
      "Backend",
      "CSS",
      "Frontend",
      "General",
      "IT & Software",
      "Photography",
      "Programming Language",
      "Technology",
    ];
  }, [availableCategories]);

  return (
    <aside className=" w-full   md:w-[300px] p-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span>
          <MdFilterList />
        </span>
        Filters
      </h2>

      <div className="mb-6 border border-[#E7E7E7] rounded-[10px] p-4">
        <div
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => setOpen({ ...open, categories: !open.categories })}
        >
          <h3 className="font-semibold ">{categoryTitle}</h3>
          {open.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {open.categories && (
          <div className="mt-3 space-y-2">
            {categoryLabels.map((item, i) => (
              <label key={i} className="flex items-center capitalize gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.has(item)}
                  onChange={() => onToggleCategory(item)}
                  className="accent-rose-500"
                />
                <span className="text-[#6D6D6D] text-[14px] capitalize font-normal">{item}</span>
              </label>
            ))}
            <button className="text-rose-500 text-sm mt-2">See More</button>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mb-6 border border-[#E7E7E7] rounded-[10px] p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOpen({ ...open, price: !open.price })}
        >
          <h3 className="font-semibold">{priceTitle}</h3>
          {open.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {open.price && (
          <div className="mt-3 space-y-2">
            {priceOptions.map((item) => (
              <label key={item.key} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice === item.key}
                  onChange={() => onChangePrice(item.key)}
                  className="accent-rose-500"
                />
                <span className="text-[#6D6D6D] text-[14px] font-normal">{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Range (informational slider) */}
      <div className="mb-6 border border-[#E7E7E7] rounded-[10px] p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOpen({ ...open, range: !open.range })}
        >
          <h3 className="font-semibold">Range</h3>
          {open.range ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {open.range && (
          <div className="mt-3">
            <p className="text-[#6D6D6D] text-[14px] font-normal">$50 — $100</p>
            <input type="range" min="50" max="100" className="w-full accent-rose-500" />
          </div>
        )}
      </div>

      {/* Reviews */}
      {ratingTitle && (
        <div className="mb-6 border border-[#E7E7E7] rounded-[10px] p-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setOpen({ ...open, reviews: !open.reviews })}
          >
            <h3 className="font-semibold">{ratingTitle}</h3>
            {open.reviews ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {open.reviews && (
            <div className="mt-3 space-y-2">
              {ratingOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === option}
                    onChange={() => onChangeRating(option)}
                    className="accent-rose-500"
                  />
                  <span className="text-[#6D6D6D] text-[14px] font-normal">{option}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === null}
                  onChange={() => onChangeRating(null)}
                  className="accent-rose-500"
                />
                <span className="text-[#6D6D6D] text-[14px] font-normal">Any</span>
              </label>
            </div>
          )}
        </div>
      )}
      {/* Level */}
      <div className="mb-6 border border-[#E7E7E7] rounded-[10px] p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOpen({ ...open, level: !open.level })}
        >
          <h3 className="font-semibold">{levelTitle}</h3>
          {open.level ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {open.level && (
          <div className="mt-3 space-y-2">
            {levelOptions.map((item) => (
              <label key={item.key} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="level"
                  checked={selectedLevel === item.key}
                  onChange={() => onChangeLevel(item.key)}
                  className="accent-rose-500"
                />
                <span className="text-[#6D6D6D] text-[14px] font-normal">{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {/* Clear button */}
      <div className="flex gap-2 mt-4">
        <button
          className="flex-1 border px-4 py-2 rounded"
          onClick={() => {
            if (onClear) onClear();
          }}
        >
          Clear
        </button>
      </div>
    </aside>
  );
}
