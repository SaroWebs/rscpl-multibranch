import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { Button, IconButton } from '@mui/material';
import { PencilIcon, PlusIcon, XIcon } from 'lucide-react';

const EditBookingItem = ({ booking, reload, toast, manifests, items, locations, parties }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [formInfo, setFormInfo] = useState({
        manifest_id: '',
        cn_no: '',
        cewb: '',
        cewb_expires: '',
        consignor: '',
        consignee: '',
        ship_to_party: 0,
        party_location: '',
        amount: '',
        remarks: '',
    });

    const [processedData, setProcessedData] = useState({
        totalWeight: 0,
        totalQty: 0,
        totalAmount: 0
    });

    useEffect(() => {
        if (booking) {
            setFormInfo({
                manifest_id: booking.manifest_id,
                cn_no: booking.cn_no,
                cewb: booking.cewb,
                cewb_expires: booking.cewb_expires ? new Date(booking.cewb_expires) : '',
                consignor: booking.consignor,
                consignee: booking.consignee,
                ship_to_party: booking.ship_to_party,
                party_location: booking.party_location,
                amount: booking.amount,
                remarks: booking.remarks,
            });
            setItemList(booking.items.map(item => ({
                invoice_no: item.invoice_no,
                invoice_date: new Date(item.invoice_date),
                amount: item.amount,
                itemsInfo: item.item_quantities.map(iq => ({ name: iq.item_name, qty: iq.quantity })),
                weight: item.weight
            })));
        }
    }, [booking]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookingData = {
            manifest_id: formInfo.manifest_id,
            cn_no: formInfo.cn_no,
            cewb: formInfo.cewb,
            cewb_expires: formInfo.cewb_expires,
            consignor: formInfo.consignor,
            consignee: formInfo.consignee,
            amount: processedData.totalAmount,
            remarks: formInfo.remarks,
            ship_to_party: formInfo.ship_to_party,
            party_location: formInfo.ship_to_party ? formInfo.party_location : ''
        };

        const bookingItemsData = itemList.map(item => ({
            invoice_no: item.invoice_no,
            invoice_date: item.invoice_date,
            amount: item.amount,
            weight: item.weight,
            item_quantities: item.itemsInfo.map(itemInfo => ({
                item_name: itemInfo.name,
                quantity: itemInfo.qty
            }))
        }));

        if (bookingData && bookingItemsData.length > 0) {
            axios.put(`/data/booking/update/${booking.id}`, { bookingData, bookingItemsData })
                .then(res => {
                    reload();
                    setOpenDialog(false);
                    toast.current.show({ label: 'Success', severity: 'success', detail: 'Booking updated successfully' });
                })
                .catch(err => {
                    console.log(err.message);
                    toast.current.show({ label: 'Error', severity: 'error', detail: err.message });
                });
        } else {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Invalid booking data' });
        }
    };

    return (
        <>
            <Button
                color="primary"
                variant="outlined"
                onClick={() => setOpenDialog(true)}
                startIcon={<PencilIcon className='w-4 h-4' />}
                aria-label="Edit">
                Edit
            </Button>
            <Dialog visible={openDialog} header={'Edit Booking'} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-2/3 p-4 bg-white">
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div className="items w-full border p-4 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
                            <div className={`col-span-3 flex flex-col`}>
                                <label htmlFor="mani_no" className="mb-2 text-xs font-medium text-gray-700">Lorry Manifest:</label>
                                <select
                                    name="manifest_id"
                                    id="mani_no"
                                    // value={formInfo.manifest_id}
                                    defaultValue={formInfo.manifest_id}
                                    onChange={(e) => setFormInfo({ ...formInfo, manifest_id: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                >
                                    <option value="" disabled>Select Manifest</option>
                                    {manifests && manifests.map(mani => (
                                        <option key={mani.id} value={mani.id}>
                                            {mani.lorry?.lorry_number + '-' + new Date(mani.trip_date).toLocaleDateString('en-GB')}
                                            ({mani.manifest_no})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col col-span-2">
                                <label htmlFor="cn_no" className="mb-2 text-xs font-medium text-gray-700">CN no: <span className="text-red-700">*</span> </label>
                                <input type="text"
                                    name="cn_no"
                                    id="cn_no"
                                    value={formInfo.cn_no}
                                    onChange={(e) => setFormInfo({ ...formInfo, cn_no: e.target.value })}
                                    className="bg-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="cewb" className="mb-2 text-xs font-medium text-gray-700">CEWB:</label>
                                <input type="text"
                                    name="cewb"
                                    id="cewb"
                                    value={formInfo.cewb}
                                    onChange={(e) => setFormInfo({ ...formInfo, cewb: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                />
                            </div>

                            <div className={`col-span-3 flex flex-col `}>
                                <label htmlFor="consignor" className="mb-2 text-xs font-medium text-gray-700">Consignor:</label>
                                <select
                                    name="consignor"
                                    id="consignor"
                                    value={formInfo.consignor}
                                    onChange={(e) => setFormInfo({ ...formInfo, consignor: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                >
                                    <option value="" disabled>Select Consignor</option>
                                    {parties && parties.map(party => {
                                        if (party.id == formInfo.consignee) return null;
                                        if (!party.is_consignor) return null;
                                        return (<option key={party.id} value={party.id}>{party.name}</option>);
                                    })}
                                </select>
                            </div>

                            <div className={`col-span-3 flex flex-col `}>
                                <label htmlFor="consignee" className="mb-2 text-xs font-medium text-gray-700">Consignee:</label>
                                <select
                                    name="consignee"
                                    id="consignee"
                                    value={formInfo.consignee}
                                    onChange={(e) => setFormInfo({ ...formInfo, consignee: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                >
                                    <option value="" disabled>Select Consignee</option>
                                    {parties && parties.map(party => {
                                        if (party.id == formInfo.consignor) return null;
                                        if (party.is_consignor) return null;
                                        return (<option key={party.id} value={party.id}>{party.name}</option>);
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col my-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="ship_to_party"
                                    id="ship_to_party"
                                    checked={formInfo.ship_to_party}
                                    onChange={(e) => setFormInfo({ ...formInfo, ship_to_party: e.target.checked })}
                                    className=''
                                />
                                <label className="cursor-pointer text-xs" htmlFor="ship_to_party">Ship to party?</label>
                            </div>
                        </div>

                        {formInfo.ship_to_party ? (
                            <input
                                type="text"
                                name="party_location"
                                id="party_location"
                                placeholder='Party Location'
                                required
                                value={formInfo.party_location}
                                onChange={(e) => setFormInfo({ ...formInfo, party_location: e.target.value })}
                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                            />
                        ) : ''}
                    </div>

                    <BookingItems
                        items={items}
                        itemList={itemList}
                        setItemList={setItemList}
                        setProcessedData={setProcessedData}
                        toast={toast}
                    />

                    {itemList && itemList.length > 0 && (
                        <>
                            <div className="flex justify-end items-end flex-col gap-2">
                                <div className="border rounded-md pt-0 min-w-[200px] overflow-hidden">
                                    <h4 className="text-md font-semibold px-4 py-2 bg-gray-700 text-white">Summary</h4>
                                    <div className="p-4">
                                        <h6 className='py-0 my-0 text-sm'>Weight: {processedData.totalWeight + ' KG'} </h6>
                                        <h6 className='py-0 my-0 text-sm'>Quantity: {processedData.totalQty}</h6>
                                        <h6 className='py-0 my-0 text-sm'>Amount: {'Rs ' + processedData.totalAmount}</h6>
                                    </div>
                                </div>

                                <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
                                    Update Booking
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </Dialog>
        </>
    );
}

export default EditBookingItem;

const BookingItems = ({ items, itemList, setItemList, setProcessedData, toast }) => {
    const [formItem, setFormItem] = useState({
        invoice_no: '',
        invoice_date: new Date(),
        amount: 0,
        itemsInfo: items.map(ix => ({ name: ix.name, qty: 0 })),
        weight: 0
    });

    const handleItemInfoChange = (updatedItem) => {
        updatedItem.qty = isNaN(parseInt(updatedItem.qty, 10)) ? 0 : parseInt(updatedItem.qty, 10);
        if (updatedItem.qty > 0) {
            const newItemsInfo = formItem.itemsInfo.map(item =>
                item.name === updatedItem.name ? { ...item, qty: updatedItem.qty } : item
            );
            setFormItem({ ...formItem, itemsInfo: newItemsInfo });
        } else {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Quantity can not be a negative value' });
        }
    };

    const reloadForm = () => {
        setFormItem({
            invoice_no: '',
            invoice_date: new Date(),
            amount: 0,
            itemsInfo: items.map(ix => ({ name: ix.name, qty: 0 })),
            weight: 0
        });
    }

    useEffect(() => {
        reloadForm();
    }, []);

    const AddItemQty = async (e) => {
        e.preventDefault();

        const formQty = formItem.itemsInfo?.length > 0 ? formItem.itemsInfo.reduce((acc, itemInfo) => acc + parseInt(itemInfo.qty || 0), 0) : 0;
        if (!formItem.invoice_no) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter Invoice Number' });
            return false;
        }

        const inList = itemList.some(il => il.invoice_no === formItem.invoice_no);
        if (inList) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Duplicate Invoice entry !' });
            return false;
        }

        if (formItem.amount <= 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter Amount' });
            return false;
        }

        if (formQty <= 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter Items Quantities' });
            return false;
        }

        if (formItem.weight <= 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter weight' });
            return false;
        }

        try {
            const res = await axios.post('/data/invoice/check', { invoice_no: formItem.invoice_no });

            if (res.data.available) {
                const newItemList = [...itemList, {
                    ...formItem,
                    item_quantities: formItem.itemsInfo.map(info => ({
                        item_name: info.name,
                        quantity: info.qty
                    }))
                }];
                setItemList(newItemList);
                updateProcessedData(newItemList);
                reloadForm();
            } else {
                toast.current.show({ label: 'Error', severity: 'error', detail: 'Invoice has been already submitted. Please enter another invoice number' });
            }
        } catch (err) {
            toast.current.show({ label: 'Error', severity: 'error', detail: err.message });
        }
    };

    const removeItem = (index) => {
        const updatedItemList = [...itemList];
        updatedItemList.splice(index, 1);
        setItemList(updatedItemList);
        updateProcessedData(updatedItemList);
    };

    const updateProcessedData = (newItemList) => {
        const totalWeight = newItemList.reduce((acc, itm) => acc + parseInt(itm.weight || 0), 0);
        const totalAmount = newItemList.reduce((acc, itm) => acc + parseInt(itm.amount || 0), 0);
        const totalQty = newItemList.reduce((acc, itm) => acc + itm.itemsInfo.reduce((acc2, itemInfo) => acc2 + parseInt(itemInfo.qty || 0), 0), 0);

        setProcessedData({
            totalWeight,
            totalQty,
            totalAmount
        });
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center">
                <h3 className='font-bold text-xl'>Booking Details</h3>
            </div>
            <table className="w-full mt-4 border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-2 text-sm max-w-[100px]">Invoice No</th>
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Invoice Date</th>
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Amount</th>
                        {items.map((itm, i) => (
                            <th key={i} className="border capitalize border-gray-200 p-2 text-sm max-w-[40px]">{itm.name}</th>
                        ))}
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Weight(KG)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((itm, index) => (
                        <tr key={index}>
                            <td className="border border-gray-200 text-center text-sm max-w-[100px]">{itm.invoice_no}</td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">{new Date(itm.invoice_date).toLocaleDateString('en-GB')}</td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">{itm.amount}</td>
                            {itm.itemsInfo.map((itemInfo, i) => (
                                <td key={i} className="border border-gray-200 text-center text-sm max-w-[40px]">{itemInfo.qty}</td>
                            ))}
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">{itm.weight}</td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                                <IconButton onClick={() => removeItem(index)}>
                                    <XIcon className='h-4 w-4 text-orange-600' />
                                </IconButton>
                            </td>
                        </tr>
                    ))}

                    <tr className='border-2 border-green-800'>
                        <td className="border border-gray-200 text-center text-sm max-w-[100px]">
                            <input type="text"
                                name="invoice_no"
                                id="inv_no"
                                value={formItem.invoice_no}
                                onChange={e => setFormItem({ ...formItem, invoice_no: e.target.value })}
                                className="w-full text-xs border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Invoice Number'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <DatePicker
                                selected={formItem.invoice_date}
                                dateFormat={'dd/MM/YYYY'}
                                onChange={(date) => setFormItem({ ...formItem, invoice_date: date })}
                                name="invoice_date"
                                id="inv_date"
                                className="w-full text-xs border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholderText='Select Date'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input type="text"
                                name="amount"
                                id="inv_amt"
                                value={formItem.amount}
                                onChange={(e) => setFormItem({ ...formItem, amount: e.target.value })}
                                className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='amount'
                            />
                        </td>
                        {formItem.itemsInfo.map((itm, i) => (
                            <td key={i} className="border border-gray-200 text-center text-sm max-w-[40px]">
                                <input type="text"
                                    name="qty"
                                    value={itm.qty}
                                    onChange={(e) => handleItemInfoChange({ name: itm.name, qty: e.target.value })}
                                    className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                />
                            </td>
                        ))}
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input type="text"
                                name="weight"
                                id="grss_weight"
                                value={formItem.weight}
                                onChange={(e) => setFormItem({ ...formItem, weight: e.target.value })}
                                className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Gross Weight'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <IconButton onClick={AddItemQty}>
                                <PlusIcon className='h-4 w-4 text-green-600' />
                            </IconButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};