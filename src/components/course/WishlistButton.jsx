import React, { useState, useEffect } from "react";
import WishlistService from "@/lib/services/wishlistService";
import useAuthStore from "@/store/authStore";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";

const WishlistButton = ({ course, onWishlistToggle }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && course._id) {
      checkWishlistStatus();
    }
  }, [user, course._id]);

  const checkWishlistStatus = async () => {
    try {
      const result = await WishlistService.checkWishlistStatus(course._id);
      if (result.success) {
        setIsInWishlist(result.data.isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please login to manage your wishlist");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const toastId = toast.loading(
        isInWishlist ? "Removing from wishlist..." : "Adding to wishlist..."
      );
      const result = await WishlistService.toggleWishlist(course._id);

      if (result.success) {
        const newWishlistStatus = !isInWishlist;
        setIsInWishlist(newWishlistStatus);

        if (newWishlistStatus) {
          toast.success("Added to wishlist! ❤️", { id: toastId });
        } else {
          toast.success("Removed from wishlist", { id: toastId });
        }

        if (onWishlistToggle) {
          onWishlistToggle(newWishlistStatus);
        }
      } else {
        toast.error(result.message || "Failed to update wishlist", {
          id: toastId,
        });
        setError(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wishlist-section w-full whitespace-nowrap">
      <button
        onClick={handleWishlistToggle}
        disabled={isLoading || !user}
        className={`
          p-2 rounded-full transition-all duration-300 border-2
          ${
            isInWishlist
              ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}
          ${!user ? "opacity-50 cursor-not-allowed" : ""}
        `}
        title={
          user
            ? isInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
            : "Login to add to wishlist"
        }
      >
        {isInWishlist ? (
          <FaHeart className="w-5 h-5" />
        ) : (
          <div className="flex gap-3 items-center">
            <FaRegHeart className="w-5 h-5" />
            Add to Wishlist
          </div>
        )}
      </button>
    </div>
  );
};

export default WishlistButton;
