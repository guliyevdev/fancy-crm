import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  line: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  confirmations: {
    marginTop: 30,
  },
  confirmationLine: {
    marginBottom: 20,
  },
  centeredText: {
    textAlign: 'center',
  },
});

const FinalDeliveryActPage = ({ partner }) => (
  <>
    <Text style={styles.title}>FINAL DELIVERY ACT</Text>

    <Text style={styles.line}>________________________________________</Text>

    <Text>Baku city</Text>

    <View style={styles.section}>
      <Text style={{ marginTop: 10 }}>Company: FANCY GROUP LLC</Text>
      <Text style={{ marginTop: 10 }}>Tax ID (VÖEN): 7889645047</Text>
      <Text style={{ marginTop: 10 }}>Owner: {partner?.name || '___________'}</Text>
      <Text style={{ marginTop: 10 }}>
        ID № {partner?.passportNumber || '__________'}, FIN: {partner?.finCode || '__________'}
      </Text>
      <Text style={{ marginTop: 10 }}>Address: {partner?.address || '__________'}</Text>
      <Text style={{ marginTop: 10 }}>E-mail: {partner?.email || '__________'}</Text>
      <Text style={{ marginTop: 10 }}>Phone: {partner?.phone || '__________'}</Text>
    </View>

    <Text style={styles.section}>
      We hereby confirm, as the Owner, the receipt, and as the Company, the delivery of the following Items under the above-mentioned Agreement:
    </Text>

    <View style={styles.section}>
      <Text>1. Quantity:</Text>
      <Text>________________________________________</Text>

      <Text style={{ marginTop: 10 }}>2. Description of Items upon return:</Text>
      <Text>________________________________________</Text>

      <Text style={{ marginTop: 10 }}>3. Condition of Items upon return:</Text>
      <Text>________________________________________</Text>

      <Text style={{ marginTop: 10 }}>4. Photos of Items upon return (may be attached to the act):</Text>
      <Text>________________________________________</Text>

      <Text style={{ marginTop: 10 }}>5. Additional notes (comments, suggestions, etc.):</Text>
      <Text>________________________________________</Text>
      <Text>________________________________________</Text>
    </View>

    <View style={styles.confirmations}>
      <Text style={[styles.confirmationLine, styles.label]}>Owner’s receipt confirmation:</Text>
      <Text>(Name)    (Surname)    (Signature)    (Date)</Text>

      <Text style={[styles.confirmationLine, styles.label]}>Company’s delivery confirmation:</Text>
      <Text>(Name)    (Surname)    (Signature)    (Date)</Text>
    </View>
  </>
);

export default FinalDeliveryActPage;
