import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  companyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    letterSpacing: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    fontSize: 10,
    color: '#666666',
  },
  headerRightText: {
    marginBottom: 2,
  },
  providerCustomerSection: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  providerSection: {
    flex: 1,
    marginRight: 40,
  },
  customerSection: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  providerText: {
    fontSize: 10,
    marginBottom: 3,
    color: '#333333',
  },
  providerCompany: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333333',
  },
  invoiceSection: {
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  invoiceDetailsTable: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  invoiceDetailCell: {
    border: '1px solid #cccccc',
    padding: 8,
    minHeight: 40,
  },
  invoiceDetailHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    fontSize: 10,
    borderBottom: '1px solid #cccccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  invoiceDetailValue: {
    fontSize: 10,
    color: '#333333',
  },
  servicesSection: {
    marginBottom: 30,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  table: {
    border: '1px solid #cccccc',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #cccccc',
  },
  tableHeaderCell: {
    padding: 10,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    borderRight: '1px solid #cccccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #cccccc',
  },
  tableCell: {
    padding: 10,
    fontSize: 10,
    color: '#333333',
    textAlign: 'center',
    borderRight: '1px solid #cccccc',
  },
  descriptionCol: { width: '70%' },
  valueCol: { width: '30%' },
});
const InitialDeliveryActPage = ({ partner, deliveryData, category }) => {
  const today = new Date().toLocaleDateString();

  return (
    <>
      

      <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
        INITIAL DELIVERY ACT
      </Text>

      <Text>Baku city</Text>

      <View style={{ marginTop: 10 }}>
        <Text style={{ marginTop: 5 }}>Company: {partner.companyName}</Text>
        <Text style={{ marginTop: 5 }}>Tax ID (VÖEN): 7889645047</Text>
        <Text style={{ marginTop: 5 }}>Owner: {partner?.name || '__________'}</Text>
        <Text style={{ marginTop: 5 }}>ID №: {partner?.passportNumber || '_______'}  </Text> 
        <Text style={{ marginTop: 5 }}>FIN: {partner?.finCode || '_______'}</Text>
        <Text style={{ marginTop: 5 }}>Address: {partner?.address || '__________'}</Text>
        <Text style={{ marginTop: 5 }}>E-mail: {partner?.email || '__________'}</Text>
        <Text style={{ marginTop: 5 }}>Phone: {partner?.phone || '__________'}</Text>
        </View>


      <Text style={{ marginTop: 10 }}>
        We hereby confirm, as the Owner, the delivery, and as the Company, the receipt of the following Items under the above-mentioned Agreement:
      </Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.descriptionCol]}>1. Product name:</Text>
          <Text style={[styles.tableCell, styles.valueCol]}>{deliveryData?.name || '__________'}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.descriptionCol]}>1. Product code:</Text>
          <Text style={[styles.tableCell, styles.valueCol]}>{deliveryData?.code || '__________'}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.descriptionCol]}>2. Quantity of Items:</Text>
          <Text style={[styles.tableCell, styles.valueCol]}>{deliveryData?.quantity || '__________'}</Text>
        </View>
        
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.descriptionCol]}>3. Type of Items:</Text>
          <Text style={[styles.tableCell, styles.valueCol]}>{category?.name || '__________'}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.descriptionCol]}>4. Weight of Items:</Text>
          <Text style={[styles.tableCell, styles.valueCol]}>{deliveryData?.weight || '__________'}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.descriptionCol]}>5. Photos of Items:</Text>
          <Text style={[styles.tableCell, styles.valueCol]}>Attached</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.descriptionCol]}>6. Additional notes:</Text>
          <Text style={[styles.tableCell, styles.valueCol]}>{deliveryData?.notes || '__________'}</Text>
        </View>
      </View>

      <Text style={{ marginTop: 10, fontStyle: 'italic' }}>
        *Note: Additional information is included in the valuation act, considered an attachment to this act.
      </Text>

      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Owner’s delivery confirmation:</Text>
      <Text>(Name)  (Surname)    (Signature)   (Date)</Text>

      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Company’s receipt confirmation:</Text>
      <Text>(Name)  (Surname)    (Signature)   (Date)</Text>

      <Text style={{ marginTop: 30, textAlign: 'center' }}>
        № {deliveryData?.number || '_'}, dated {deliveryData?.date || '______'}
      </Text>
    </>
  );
};

export default InitialDeliveryActPage;
