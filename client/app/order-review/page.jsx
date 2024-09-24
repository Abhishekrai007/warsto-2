"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { StarIcon } from "@heroicons/react/solid";
import api from "@/utils/api";
import { toast } from "@/components/ui/toast";
// import { StarsIcon } from "lucide-react";

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    className={`w-8 h-8 cursor-pointer transition-all duration-200 ${
      filled ? "text-yellow-400 scale-110" : "text-gray-300 hover:scale-110"
    }`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const OrderReview = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [reviews, setReviews] = useState({});
  const [hoveredRating, setHoveredRating] = useState({});
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (order) {
      const initialReviews = {};
      order.items.forEach((item) => {
        initialReviews[item.product._id] = {
          rating: 0,
          comment: "",
          images: [],
        };
      });
      setReviews(initialReviews);
    }
  }, [order]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      initializeReviews(response.data.items);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const initializeReviews = (items) => {
    const initialReviews = {};
    items.forEach((item) => {
      initialReviews[item.product.toString()] = {
        rating: 0,
        comment: "",
        images: [],
      };
    });
    console.log("Initialized reviews:", initialReviews);
    setReviews(initialReviews);
  };

  const handleReviewChange = (productId, field, value) => {
    console.log(`Updating ${field} for product ${productId} to:`, value);
    setReviews((prevReviews) => ({
      ...prevReviews,
      [productId]: {
        ...prevReviews[productId],
        [field]:
          field === "rating"
            ? Math.max(1, Math.min(5, parseInt(value, 10)))
            : value,
      },
    }));
  };

  const handleImageUpload = (productId, event) => {
    const files = Array.from(event.target.files);
    if (files.length > 5) {
      toast({
        title: "Error",
        description: "You can only upload up to 5 images.",
        variant: "destructive",
      });
      return;
    }

    setReviews((prevReviews) => ({
      ...prevReviews,
      [productId]: {
        ...prevReviews[productId],
        images: files,
      },
    }));
  };

  const handleSubmitReview = async (productId) => {
    try {
      const reviewData = reviews[productId];
      console.log("Full review data before submission:", reviewData);

      if (!reviewData) {
        console.error("No review data found for product:", productId);
        return;
      }

      const formData = new FormData();
      formData.append("productId", productId);
      formData.append(
        "rating",
        reviewData.rating ? reviewData.rating.toString() : "1"
      );
      formData.append("comment", reviewData.comment || "");

      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await api.post("/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Review submission response:", response.data);

      // Clear the review data after successful submission
      setReviews((prevReviews) => ({
        ...prevReviews,
        [productId]: { rating: 0, comment: "", images: [] },
      }));
    } catch (error) {
      console.error("Error in handleSubmitReview:", error);
    }
  };

  const handleStarHover = (productId, rating) => {
    setHoveredRating((prev) => ({ ...prev, [productId]: rating }));
  };

  const handleStarLeave = (productId) => {
    setHoveredRating((prev) => ({ ...prev, [productId]: 0 }));
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Order Review</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Order #{order._id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <p>
              <span className="font-semibold">Order Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Total:</span> ₹
              {order.total.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {order.status}
            </p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mt-8 mb-6 text-center">
        Product Reviews
      </h2>
      {order.items.map((item) => (
        <Card key={item.product.toString()} className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{item.productName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p>
                <span className="font-semibold">Quantity:</span> {item.quantity}
              </p>
              <p>
                <span className="font-semibold">Price:</span> ₹
                {item.price.toFixed(2)}
              </p>
            </div>
            <div className="mt-6">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={
                      star <=
                      (hoveredRating[item.product.toString()] ||
                        reviews[item.product.toString()]?.rating ||
                        0)
                    }
                    onClick={() =>
                      handleReviewChange(
                        item.product.toString(),
                        "rating",
                        star
                      )
                    }
                    onMouseEnter={() =>
                      handleStarHover(item.product.toString(), star)
                    }
                    onMouseLeave={() =>
                      handleStarLeave(item.product.toString())
                    }
                  />
                ))}
                <span className="ml-2 text-lg">
                  {reviews[item.product.toString()]?.rating || 0}/5
                </span>
              </div>
              <Textarea
                className="mt-4 w-full"
                placeholder="Write your review here..."
                value={reviews[item.product.toString()]?.comment || ""}
                onChange={(e) =>
                  handleReviewChange(
                    item.product.toString(),
                    "comment",
                    e.target.value
                  )
                }
              />
              <div className="mt-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    handleImageUpload(item.product.toString(), e)
                  }
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload up to 5 images
                </p>
              </div>
              <Button
                className="mt-6 w-full"
                onClick={() => handleSubmitReview(item.product.toString())}
              >
                Submit Review
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderReview;
