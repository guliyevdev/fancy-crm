import React, { useEffect, useState } from 'react'
import ReturnPaymentService from '../services/ReturnPaymentService';
const ReturnPayment = () => {
    const [paymentHistory, setPaymentHistory] = useState([]);
    useEffect(() => {
        const fetchPaymentHistory = async () => {
            const response = await ReturnPaymentService.GetPaymentHistory();
            setPaymentHistory(response.data?.data || []);
            console.log(response.data?.data);
        }
        fetchPaymentHistory();
    }, []);
    return (
        <div>
        </div>
    )
}

export default ReturnPayment;