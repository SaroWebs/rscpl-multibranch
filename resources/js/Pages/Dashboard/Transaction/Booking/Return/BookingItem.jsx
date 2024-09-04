﻿import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@mui/material';
import { BreadCrumb } from 'primereact/breadcrumb';
import React, { useEffect, useRef, useState } from 'react'

const BookingItem = (props) => {
    const items = [
        { label: "Transaction", url: '#' },
        { label: "Booking", url: '/transaction/booking' },
        { label: props.booking.id },
    ];
    const { booking } = props;
    const [print, setPrint] = useState(false);
    const printRef = useRef(null);
    let branch = booking.manifest?.branch;

    const itemNames = [...new Set(booking.items.flatMap(item => item.item_quantities.map(itemQuantity => itemQuantity.item_name)))];

    const totalAmount = booking.items.reduce((accumulator, currentItem) => accumulator + parseInt(currentItem.amount), 0);
    const totalQuantities = booking.items.reduce((sum, item) => sum + item.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0), 0);
    const totalWeight = booking.items.reduce((sum, item) => sum + item.weight, 0);


    useEffect(() => {
        if (print) {
            window.print();
            setPrint(false);
        }
    }, [print]);

    const handlePrint = () => {
        setPrint(true);
    };
    return (
        <AdminLayout
            user={props.auth?.user}
            page="Return Booking"
        >
            <Head title="Return Booking" />
            <BreadCrumb model={items} className='py-4 text-gray-500' />
           
            <div className="p-8 mt-8 bg-white rounded-lg">
                <Button onClick={handlePrint} color="warning" variant="outlined" size="small" sx={{}}>
                    Print
                </Button>
                <div className="px-4 print-content" ref={printRef}>
                    <table className='w-full'>
                        <thead>
                            <tr>
                                <td>
                                    <div className="page-header-space">
                                        <div className="page-header">
                                            <div className="header-info">
                                                <div className="flex justify-center pb-8">
                                                    <h2 className='px-6 underline font-bold'>Return Consignment Note</h2>
                                                </div>
                                                <div className="flex flex-col gap-2 border-b ">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 branch_details">
                                                            <h2 className="text-3xl font-bold uppercase text-gray-800">{branch?.name}</h2>
                                                            <p className="max-w-[400px]">
                                                                {branch?.address ?
                                                                    <span className="font-semibold text-gray-700">
                                                                        {branch?.address}
                                                                    </span>
                                                                    :
                                                                    <span className="font-semibold">
                                                                        {branch?.location?.name}
                                                                    </span>
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="flex-1 Date flex justify-end">
                                                            <div className="">
                                                                <h4>CN no: <span>{booking.cn_no}</span></h4>
                                                                <h4>Date:
                                                                    <span>
                                                                        {new Date(booking.manifest?.trip_date).toLocaleDateString('en-GB', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                        }).replace(/ /g, '-')}
                                                                    </span>
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <div className="grid grid-cols-2 items-start text-gray-500">
                                                        <div className="">
                                                            <h3 className="text-xl font-semibold">Consignor (Party)</h3>
                                                            <h5 className="">{booking.consignee.name}</h5>
                                                            <h5 className="">
                                                                {booking.party_location ? "Party Location : " + booking.party_location : "Location : " + booking.consignee.location?.name}
                                                            </h5>
                                                            {booking.consignee.address ?  <p >{'Address:'} <span>{booking.consignee.address}</span></p> :''}
                                                        </div>
                                                        <div className="">
                                                            <h3 className="text-xl font-semibold">Consignee</h3>
                                                            <h5 className="">{booking.consignor.name}</h5>
                                                            <h5 className="">Location: <span className='font-semibold'> {booking.consignor.location?.name}</span></h5>
                                                            {booking.consignor.address ?
                                                                <h5 className=""> {'Address:'} <span className='font-semibold'> {booking.consignor.address}</span></h5>
                                                                : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="page px-5">
                                        <table className="w-full border-collapse border border-gray-200">
                                            <thead className=''>
                                                <tr>
                                                    <th className="border border-gray-200 p-2">Invoice No</th>
                                                    <th className="border border-gray-200 p-2 min-w-[100px]">Invoice Date</th>
                                                    <th className="border border-gray-200 p-2">Amount</th>
                                                    {itemNames.map((itm, i) => (
                                                        <th key={i} className="border border-gray-200 p-2 capitalize">{itm}</th>
                                                    ))}
                                                    <th className="border border-gray-200 p-2">Gross Weight (KG)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {booking.items && booking.items.length > 0 && booking.items.map((itm, i) => (
                                                    <tr key={i}>
                                                        <td className="border border-gray-200 text-center p-2">{itm.invoice_no}</td>
                                                        <td className="border border-gray-200 text-center p-2">
                                                            {new Date(itm.invoice_date).toLocaleDateString('en-GB', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                            }).replace(/ /g, '-')}
                                                        </td>
                                                        <td className="border border-gray-200 text-center p-2">{itm.amount}</td>
                                                        {itm.item_quantities.map((itemInfo, i) => (
                                                            <td key={i} className="border border-gray-200 text-center p-2">{itemInfo.quantity}</td>
                                                        ))}
                                                        <td className="border border-gray-200 text-center p-2">{itm.weight}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="flex items-start justify-between py-2 calculation-section">
                                        <div className="">
                                            <h3>Vehicle No: {booking.manifest?.lorry?.lorry_number}</h3>
                                            <h3>Driver No: {booking.manifest?.lorry?.driver_number}</h3>
                                        </div>
                                        <div className="min-w-[200px] ">
                                            <h3>Total Quantity: {totalQuantities}</h3>
                                            <h3>Gross Weight: {totalWeight} KG</h3>
                                            <h3>Total Amount: {totalAmount.toFixed(2)}</h3>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                        <tfoot>
                            <div className="page-footer-space">
                            </div>
                        </tfoot>
                    </table>

                    <div className="page-footer">
                        <div className="flex justify-between items-start py-4 mt-3 page-footer-space">
                            <div className="min-w-[250px] min-h-[150px] relative">
                                <h3 className="text-xl">{branch ? branch.name : ''}</h3>
                                <div className="absolute bottom-1 left-0 right-0 flex justify-start">
                                    <span className='text-sm'>
                                        Authorised Signatory
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-[250px] min-h-[150px] relative">
                                <h3 className="text-xl uppercase">Consignee</h3>
                                <div className="absolute bottom-1 left-0 right-0 flex justify-start">
                                    <span className='text-sm'>
                                        Receiver's Sign / Stamp
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}

export default BookingItem