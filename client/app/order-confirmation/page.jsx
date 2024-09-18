"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  Truck,
  MapPin,
  CreditCard,
  ShoppingBag,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import Invoice from "@/components/Invoice";

// // Define styles for PDF
// const styles = StyleSheet.create({
//   page: { padding: 30 },
//   header: { fontSize: 18, marginBottom: 20, textAlign: "center" },
//   section: { margin: 10, padding: 10 },
//   table: {
//     display: "table",
//     width: "auto",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderRightWidth: 0,
//     borderBottomWidth: 0,
//   },
//   tableRow: { margin: "auto", flexDirection: "row" },
//   tableCol: {
//     width: "25%",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderLeftWidth: 0,
//     borderTopWidth: 0,
//   },
//   tableCell: { margin: "auto", marginTop: 5, fontSize: 10 },
// });

// Create Invoice component
// const Invoice = ({ order }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <Text style={styles.header}>Invoice</Text>
//       <View style={styles.section}>
//         <Text>Order ID: {order._id}</Text>
//         <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
//       </View>
//       <View style={styles.section}>
//         <Text>Shipping Address:</Text>
//         <Text>{`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}, ${order.shippingAddress.zipCode}`}</Text>
//       </View>
//       <View style={styles.table}>
//         <View style={styles.tableRow}>
//           <View style={styles.tableCol}>
//             <Text style={styles.tableCell}>Product</Text>
//           </View>
//           <View style={styles.tableCol}>
//             <Text style={styles.tableCell}>Quantity</Text>
//           </View>
//           <View style={styles.tableCol}>
//             <Text style={styles.tableCell}>Price</Text>
//           </View>
//           <View style={styles.tableCol}>
//             <Text style={styles.tableCell}>Total</Text>
//           </View>
//         </View>
//         {order.items.map((item) => (
//           <View style={styles.tableRow} key={item._id}>
//             <View style={styles.tableCol}>
//               <Text style={styles.tableCell}>{item.productName}</Text>
//             </View>
//             <View style={styles.tableCol}>
//               <Text style={styles.tableCell}>{item.quantity}</Text>
//             </View>
//             <View style={styles.tableCol}>
//               <Text style={styles.tableCell}>₹{item.price}</Text>
//             </View>
//             <View style={styles.tableCol}>
//               <Text style={styles.tableCell}>
//                 ₹{item.price * item.quantity}
//               </Text>
//             </View>
//           </View>
//         ))}
//       </View>
//       <View style={styles.section}>
//         <Text>Subtotal: ₹{order.subtotal}</Text>
//         <Text>Discount: ₹{order.discount}</Text>
//         <Text>Delivery Fee: ₹{order.deliveryFee}</Text>
//         <Text>Total: ₹{order.total}</Text>
//       </View>
//     </Page>
//   </Document>
// );

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = new URLSearchParams(window.location.search).get(
          "orderId"
        );
        if (!orderId) {
          toast.error("Order ID not found");
          router.push("/");
          return;
        }

        const orderResponse = await api.get(`/orders/${orderId}`);
        setOrder(orderResponse.data);

        if (orderResponse.data.items && orderResponse.data.items.length > 0) {
          const relatedResponse = await api.get(
            `/products/${orderResponse.data.items[0].product}/related`
          );
          setRelatedProducts(relatedResponse.data);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        if (error.response && error.response.status === 404) {
          // Order not found
          setOrder(null);
        } else {
          toast.error("Failed to fetch order details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h1 className="text-3xl font-bold mb-6">Order Not Found</h1>
        <p className="text-lg mb-8">
          We couldn't find the order you're looking for. Please check your order
          ID and try again.
        </p>
        <Button onClick={() => router.push("/")} size="lg">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Card className="mb-12 bg-gradient-to-r from-green-50 to-green-100">
        <CardContent className="flex items-center justify-between p-8">
          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Order Confirmed
            </h1>
            <p className="text-lg text-green-600">
              Thank you for your order! Your order number is:{" "}
              <span className="font-semibold">{order._id}</span>
            </p>
          </div>
          <CheckCircle className="h-16 w-16 text-green-500" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" /> Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Status:</span>
              <span className="capitalize font-medium">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                {order.paymentMethod}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-2">{order.shippingAddress.street}</p>
            <p className="text-lg mb-2">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
            <p className="text-lg">
              {order.shippingAddress.country}, {order.shippingAddress.zipCode}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center justify-between">
            <span>Order Summary</span>
            <PDFDownloadLink
              document={<Invoice order={order} />}
              fileName="invoice.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  "Loading document..."
                ) : (
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Download Invoice
                  </Button>
                )
              }
            </PDFDownloadLink>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center py-3 border-b"
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-medium">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Discount</span>
              <span className="text-green-600">-₹{order.discount}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <Truck className="mr-2 h-6 w-6" /> Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium mb-2">
            {order.deliveryOption} Delivery
          </p>
          <p className="text-gray-600">
            Estimated delivery:{" "}
            {order.deliveryOption === "express"
              ? "2-3 business days"
              : "5-7 business days"}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Related Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-lg font-medium mb-3">
                    ₹{product.price.amount}
                  </p>
                  <Button
                    onClick={() => router.push(`/product/${product._id}`)}
                    className="w-full"
                  >
                    View Product
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => router.push("/")} size="lg" className="px-8">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
