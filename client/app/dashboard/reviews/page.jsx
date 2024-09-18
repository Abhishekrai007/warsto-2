"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ThumbsUp,
} from "lucide-react";
import api from "@/utils/api";
import AdminLayout from "@/components/AdminDashboard";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ImageViewer from "@/components/ImageViewer";
const StatusBadge = ({ status }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <Badge
      className={`${statusColors[status]} px-2 py-1 rounded-full text-xs font-semibold`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const ReviewDialog = ({ review, onClose, onStatusChange }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!review) return null;

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };
  console.log(review.images);
  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle className="text-2xl">Review Details</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Product</p>
              <p className="text-base font-semibold text-gray-900">
                {review.product?.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">User</p>
              <p className="text-base font-semibold text-gray-900">
                {review.user.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Rating</p>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="text-base font-semibold text-gray-900">
                  {review.rating}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <StatusBadge status={review.status} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Comment</p>
            <p className="text-base text-gray-900">{review.comment}</p>
          </div>
          <div className="flex items-center space-x-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">
              {review.helpful} helpful votes
            </span>
          </div>
          {review.images && review.images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Images</p>
              <div className="grid grid-cols-3 gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000/${image.url}`}
                    alt={image.caption || `Review image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      {review.status === "pending" && (
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onStatusChange(review._id, "approved")}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Approve
          </Button>
          <Button
            variant="destructive"
            onClick={() => onStatusChange(review._id, "rejected")}
          >
            <XCircle className="h-4 w-4 mr-2" /> Reject
          </Button>
        </DialogFooter>
      )}
      {selectedImage && (
        <ImageViewer
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </DialogContent>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchReviews = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const [reviewsResponse, statsResponse] = await Promise.all([
        api.get(`admin/reviews?page=${page}&limit=10`),
        api.get("admin/reviews/stats"),
      ]);
      setReviews(reviewsResponse.data.reviews);
      setTotalPages(reviewsResponse.data.totalPages);
      setReviewStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching reviews data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(currentPage);
  }, [fetchReviews, currentPage]);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await api.put(`admin/reviews/${reviewId}/status`, { status: newStatus });
      fetchReviews(currentPage);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating review status:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openReviewDialog = (review) => {
    setSelectedReview(review);
    setIsDialogOpen(true);
  };

  const MetricCard = ({ title, value, icon, color }) => (
    <Card
      className={`bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${color}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Review Management
        </h1>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <MetricCard
            title="Total Reviews"
            value={reviewStats.totalReviews}
            icon={<Star className="h-6 w-6 text-yellow-500" />}
            color="border-yellow-500"
          />
          <MetricCard
            title="Pending Reviews"
            value={reviewStats.pendingReviews}
            icon={<AlertCircle className="h-6 w-6 text-orange-500" />}
            color="border-orange-500"
          />
          <MetricCard
            title="Approved Reviews"
            value={reviewStats.approvedReviews}
            icon={<CheckCircle className="h-6 w-6 text-green-500" />}
            color="border-green-500"
          />
          <MetricCard
            title="Rejected Reviews"
            value={reviewStats.rejectedReviews}
            icon={<XCircle className="h-6 w-6 text-red-500" />}
            color="border-red-500"
          />
        </div>

        <Card className="bg-white shadow-md">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600">Product</TableHead>
                  <TableHead className="text-gray-600">User</TableHead>
                  <TableHead className="text-gray-600">Rating</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {review.product?.name}
                    </TableCell>
                    <TableCell>{review.user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {review.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={review.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(review)}
                        className="mr-2"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedReview && (
            <ReviewDialog
              review={selectedReview}
              onClose={() => setIsDialogOpen(false)}
              onStatusChange={handleStatusChange}
            />
          )}
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Reviews;
