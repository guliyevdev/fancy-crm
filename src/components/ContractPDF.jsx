import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  companyTitle: { fontSize: 18, fontWeight: "bold" },
  headerRight: { alignItems: "flex-end" },
  sectionHeader: { fontWeight: "bold", fontSize: 14, marginBottom: 5 },
  providerCustomerSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  providerSection: { width: "48%" },
  customerSection: { width: "48%" },
  invoiceSection: { marginBottom: 20 },
  invoiceTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  invoiceDetailsTable: { flexDirection: "row", marginBottom: 10 },
  invoiceDetailCell: { padding: 5, border: "1px solid #000" },
  invoiceDetailHeader: { fontWeight: "bold" },
  invoiceDetailValue: { marginTop: 2 },
  servicesSection: { marginTop: 20 },
  servicesTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  table: { borderWidth: 1, borderColor: "#000" },
  tableHeader: { flexDirection: "row", backgroundColor: "#eee" },
  tableHeaderCell: { padding: 5, borderRight: "1px solid #000", fontWeight: "bold" },
  tableCell: { padding: 5, borderTop: "1px solid #000", borderRight: "1px solid #000" },
  descriptionCol: { width: "50%" },
  valueCol: { width: "50%" },
});

function ContractPDF({ order,orderCode }) {
  const invoiceDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyTitle}>Fancy Company LLC</Text>
          <View style={styles.headerRight}>
            <Text>Fancy Company LLC</Text>
            <Text>Tax ID: 3*******4</Text>
          </View>
        </View>

        {/* Provider & Customer */}
        <View style={styles.providerCustomerSection}>
          <View style={styles.providerSection}>
            <Text style={styles.sectionHeader}>PROVIDER</Text>
            <Text>Fancy Company LLC</Text>
            <Text>Tax ID: 3*******4</Text>
            <Text>ADDRESS 345 </Text>
          </View>
          <View style={styles.customerSection}>
            <Text style={styles.sectionHeader}>CUSTOMER</Text>
            <Text>{order.customerCode}</Text>
            <Text>{order.customerEmail}</Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.invoiceSection}>
          <Text style={styles.invoiceTitle}>Order Details</Text>
          <View style={styles.invoiceDetailsTable}>
            <View style={[styles.invoiceDetailCell, { width: "50%" }]}>
              <Text style={styles.invoiceDetailHeader}>Date</Text>
              <Text style={styles.invoiceDetailValue}>{invoiceDate}</Text>
            </View>
            <View style={[styles.invoiceDetailCell, { width: "50%" }]}>
              <Text style={styles.invoiceDetailHeader}>Order Code</Text>
              <Text style={styles.invoiceDetailValue}>{orderCode}</Text>
            </View>
            <View style={[styles.invoiceDetailCell, { width: "50%" }]}>
              <Text style={styles.invoiceDetailHeader}>Order type</Text>
              <Text style={styles.invoiceDetailValue}>{order.type}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.servicesSection}>
        <Text style={styles.servicesTitle}>Order Items</Text>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1px solid #000", fontWeight: "bold" }}>
            <Text>Product</Text>
            <Text>Quantity</Text>
          </View>

          {order.orderItems?.map((item, index) => (
            <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1px solid #eee" }}>
              <Text>{item.code}</Text>
              <Text>{item.quantity}</Text>
            </View>
          ))}
        </View>
      </View>


       

        {/* Payment Details */}
        <View style={styles.servicesSection}>
          <Text style={styles.servicesTitle}>Payment Summary</Text>
          <View>
            {[
              { label: "Total Price", value: `$${order.totalPrice}` },
              { label: "Deposit Paid", value: `$${order.depositPaid}` },
              { label: "Penalty Fee", value: `$${(order.penaltyFee * order.totalPrice / 100).toFixed(2)}` },
              { label: "Damage Fee", value: `$${(order.damageFee * order.totalPrice / 100).toFixed(2)}` },
            ].map((item, index) => (
              <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1px solid #eee" }}>
                <Text>{item.label}</Text>
                <Text>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>


        {/* Signature */}
        <View style={{ marginTop: 40 }}>
          <Text>Signature: ____________________________</Text>
        </View>
      </Page>
    </Document>
  );
}

export default ContractPDF;
