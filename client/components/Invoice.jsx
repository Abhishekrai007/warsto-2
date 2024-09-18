import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Register custom fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 12,
    padding: 50,
    backgroundColor: "#FFFFFF",
    color: "#333333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A5568",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2D3748",
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E0",
    paddingBottom: 5,
  },
  tableCol: {
    width: "25%",
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableCellHeader: {
    margin: "auto",
    fontSize: 12,
    fontWeight: "bold",
    color: "#4A5568",
  },
  tableCell: {
    margin: "auto",
    fontSize: 10,
  },
  subtotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  subtotalText: {
    width: "75%",
    textAlign: "right",
    paddingRight: 10,
  },
  subtotalValue: {
    width: "25%",
    textAlign: "right",
  },
  total: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#CBD5E0",
  },
  totalText: {
    width: "75%",
    textAlign: "right",
    paddingRight: 10,
    fontWeight: "bold",
    color: "#2D3748",
  },
  totalValue: {
    width: "25%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#2D3748",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 10,
    color: "#718096",
  },
});

// Create Invoice component
const Invoice = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.logo} src="/placeholder.svg?height=50&width=120" />
        <Text style={styles.title}>Invoice</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        <Text>Order ID: {order._id}</Text>
        <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
        <Text>Payment Method: {order.paymentMethod}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text>{`${order.shippingAddress.street}, ${order.shippingAddress.city}`}</Text>
        <Text>{`${order.shippingAddress.state}, ${order.shippingAddress.country}`}</Text>
        <Text>{order.shippingAddress.zipCode}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Product</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Quantity</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Price</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Total</Text>
          </View>
        </View>
        {order.items.map((item) => (
          <View style={styles.tableRow} key={item._id}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.productName}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>₹{item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.subtotal}>
        <Text style={styles.subtotalText}>Subtotal:</Text>
        <Text style={styles.subtotalValue}>₹{order.subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.subtotal}>
        <Text style={styles.subtotalText}>Discount:</Text>
        <Text style={styles.subtotalValue}>₹{order.discount.toFixed(2)}</Text>
      </View>
      <View style={styles.subtotal}>
        <Text style={styles.subtotalText}>Delivery Fee:</Text>
        <Text style={styles.subtotalValue}>
          ₹{order.deliveryFee.toFixed(2)}
        </Text>
      </View>
      <View style={styles.total}>
        <Text style={styles.totalText}>Total:</Text>
        <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
      </View>

      <Text style={styles.footer}>Thank you for your purchase!</Text>
    </Page>
  </Document>
);

export default Invoice;
