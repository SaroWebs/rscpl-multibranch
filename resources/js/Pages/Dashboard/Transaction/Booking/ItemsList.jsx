import { Link } from '@inertiajs/react';
import { IconButton, Button ,Tooltip } from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon, CircleCheckBig, Crosshair, EyeIcon, ImageIcon, PencilIcon, PrinterIcon, Trash2Icon, XIcon } from 'lucide-react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import React, { useEffect, useState } from 'react'
import AddNewItem from './AddNewItem';
import BookingStatus from './BookingStatus';
import { Dialog } from 'primereact/dialog';
import EditBookingItem from './EditBookingItem';


const ItemsList = (props) => {
    const { bookings, reload, toast, manifests, items, locations, parties } = props;
    const [searchTxt, setSearchTxt] = useState('');
    const [perPage, setPerPage] = useState(50);
    const [delivCount, setDelivCount] = useState(0);

    const [consignorId, setConsignorId] = useState('');
    const [consigneeId, setConsigneeId] = useState('');

    const handleLimitChange = (e) => setPerPage(e.target.value);
    const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

    useEffect(() => {
        reload({ per_page: perPage, search: searchTxt, cnr: consignorId, cne: consigneeId });
    }, [perPage, searchTxt, consignorId, consigneeId]);

    useEffect(() => {
        if (bookings && bookings.data) {
            let x = 0;
            bookings.data.filter(bk => {
                x = x + bk.statuses.filter(st => st.status == 'delivered');
                setDelivCount(x.length);
            })
        }
    }, [bookings]);


    const handlePrint = (id) => {
        const printUrl = `/print/booking/${id}`;
        window.open(printUrl, '_blank', 'width=1200,height=1200');
    };

    const handleDelete = (booking) => {
        confirmDialog({
            message: 'Are you sure you want to delete this booking?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteBooking(booking.id),
        });
    };

    const deleteBooking = async (id) => {
        try {
            await axios.delete(`/data/booking/delete/${id}`);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Booking deleted successfully', life: 3000 });
            reload();
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete booking', life: 3000 });
        }
    };

    const privilege = props.auth.user.role.privilege_index;

    return (
        <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
            <div className="noPrint flex justify-between my-3 mx-5">
                <h3 className="text-3xl text-slate-600">Consignments</h3>
                <div className="flex gap-2">
                    {privilege > 5 && <AddNewItem reload={reload} toast={toast} {...props} manifests={manifests}/>}
                </div>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3 border-r border-gray-100">
                    <FilterBooking
                        cnr={consignorId}
                        setCnr={setConsignorId}
                        cne={consigneeId}
                        setCne={setConsigneeId}
                        {...props}
                    />
                </div>
                <div className="col-span-9">
                    <div className="flex justify-between px-2">
                        <select value={perPage} onChange={handleLimitChange}>
                            {[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
                        </select>
                        <input type="text" placeholder="Search consignment.. " onChange={handleSearch} />
                    </div>

                    <div className="content px-2 my-4">
                        {bookings && bookings.total > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    {props.loading ? (
                                        <div className={`min-h-64 flex justify-center items-center`}>
                                            <span className='text-3xl font-semibold text-slate-500'>Loading...</span>
                                        </div>
                                    ) : (
                                        <table className="w-full border">
                                            <thead>
                                                <tr>
                                                    <th className="text-center py-3 px-2">Sl.</th>
                                                    <th className="text-left min-w-[100px]">Manifest</th>
                                                    <th className="text-left min-w-[100px]">CN No.</th>
                                                    <th className="text-left min-w-[150px]">Consignor</th>
                                                    <th className="text-left min-w-[150px]">Consignee</th>
                                                    <th className="text-left min-w-[80px]">STP</th>
                                                    <th className="text-start min-w-[100px]">Destination</th>
                                                    <th className="text-center min-w-[50px]">Qty</th>
                                                    <th className="text-center min-w-[90px]">Weight (KG)</th>
                                                    <th className="text-center min-w-[90px]">Amount (₹)</th>
                                                    <th className="text-center min-w-[120px]">Status</th>
                                                    {delivCount > 0 &&
                                                        <th className='text-center min-w-[60px]'>POD</th>
                                                    }
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.data.map((booking, i) => {
                                                    let activeStatus = booking.statuses.filter(st => st.active == 1)[0];

                                                    return (
                                                        <tr key={i} className="border">
                                                            <td className='text-center py-2'>{i + (bookings.per_page * (bookings.current_page - 1)) + 1}</td>
                                                            <td className='text-left'>
                                                                {booking.manifest?.lorry?.lorry_number}
                                                                <span className='text-xs text-red-500 font-bold'>
                                                                    ({new Date(booking.manifest.trip_date).toLocaleDateString('en-GB')})
                                                                </span>
                                                            </td>
                                                            <td className='text-left'>{booking.cn_no}</td>
                                                            <td className='text-left'>{booking.consignor?.name}</td>
                                                            <td className='text-left'>{booking.consignee?.name}</td>
                                                            <td className='text-left'>{booking.ship_to_party ? "Yes" : "No"}</td>
                                                            <td className='text-left'>
                                                                {booking.ship_to_party ? booking.party_location : booking.consignee?.location?.name}
                                                            </td>
                                                            <td className='text-center'>
                                                                {booking.items.reduce((sum, item) => sum + item.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0), 0)}
                                                            </td>
                                                            <td className='text-center'>
                                                                {booking.items.reduce((sum, item) => sum + item.weight, 0)}
                                                            </td>
                                                            <td className='text-center'>
                                                                {booking.items.reduce((ac, ci) => ac + parseInt(ci.amount), 0)}
                                                            </td>
                                                            <td className='text-center'>
                                                                {privilege > 5 ?
                                                                    <BookingStatus booking={booking} reload={reload} perPage={perPage} searchTxt={searchTxt} status={activeStatus} />
                                                                    :
                                                                    <span className='uppercase'>{activeStatus.status}</span>
                                                                }
                                                            </td>

                                                            {activeStatus && (activeStatus.status == 'delivered') ? (
                                                                <td className='text-center'>
                                                                    <DeliveryProof booking={booking} status={activeStatus} />
                                                                </td>
                                                            ) :
                                                                <td className='text-center'>
                                                                    <button disabled>
                                                                        <ImageIcon className="w-6 h-6 text-gray-100" />
                                                                    </button>
                                                                </td>
                                                            }

                                                            <td className="text-center m-2 flex gap-2">
                                                                {activeStatus && (activeStatus.status == 'pending') ? (
                                                                    <>
                                                                        <EditBookingItem
                                                                            booking={booking}
                                                                            reload={reload}
                                                                            toast={toast}
                                                                            manifests={manifests}
                                                                            items={items}
                                                                            locations={locations}
                                                                            parties={parties}
                                                                        />
                                                                        
                                                                        <Tooltip title="Delete">
                                                                            <IconButton
                                                                                color="error"
                                                                                onClick={() => handleDelete(booking)}
                                                                                aria-label="Delete">
                                                                                <Trash2Icon className='w-4 h-4' />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </>
                                                                ) :
                                                                    <Tooltip title="Edit (Disabled)">
                                                                        <span>
                                                                            <IconButton
                                                                                color="primary"
                                                                                disabled
                                                                                aria-label="Edit">
                                                                                <PencilIcon className='w-4 h-4' />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>

                                                                }
                                                                <Tooltip title="Print">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => handlePrint(booking.id)}
                                                                        aria-label="Print">
                                                                        <PrinterIcon className='h-4 w-4' />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Track Booking">
                                                                    <IconButton
                                                                        color="secondary"
                                                                        component={Link}
                                                                        href={`/booking/track?cn_no=${booking.cn_no}`}
                                                                        aria-label="Track booking">
                                                                        <Crosshair className='h-4 w-4' />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <Pagination bookings={bookings} reload={reload} perPage={perPage} searchTxt={searchTxt} />
                            </>
                        ) : <span>No Item found!</span>}
                    </div>
                </div>
            </div>

            <ConfirmDialog className="rounded-md bg-white p-4" />
        </div>
    );
}

export default ItemsList

const Pagination = ({ bookings, reload, perPage, searchTxt }) => (
    <div className="flex justify-between p-4">
        <span>Showing {bookings.from} to {bookings.to} of {bookings.total} items</span>
        <ul className="flex gap-3">
            {bookings.links.map((link, index) => {
                let page = 1;
                if (link.url) {
                    const urlParams = new URLSearchParams(new URL(link.url).search);
                    page = urlParams.get('page');
                }
                return (
                    <li key={index} className={`text-md font-semibold ${link.active ? 'underline' : ''}`}>
                        <button onClick={() => reload({ page, per_page: perPage, search: searchTxt })} dangerouslySetInnerHTML={{ __html: link.label }} />
                    </li>
                );
            })}
        </ul>
    </div>
);

const DeliveryProof = (props) => {
    const { booking, status } = props;
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
            <button onClick={() => setOpenDialog(true)}>
                <ImageIcon className="w-6 h-6 text-green-500" />
            </button>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
                <div className="">
                    <img
                        className="w-full border rounded-lg shadow-md"
                        src={`/storage/${booking.document.file_location}`}
                        alt=""
                    />
                    <hr className='my-4' />
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setOpenDialog(false)} variant="contained" size="small" color="info">Close</Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

const FilterBooking = (props) => {
    const { parties, cnr, cne, setCnr, setCne } = props;
    const [showConsignors, setShowConsignors] = useState(true);
    const [showConsignees, setShowConsignees] = useState(true);

    const clearFilter = () => {
        setCne('');
        setCnr('');
    }

    const toggleAccordion = (setter) => {
        setter(prev => !prev);
    }



    return (
        <div className='p-4 bg-gray-100 rounded-lg shadow-md'>
            <div className="flex justify-between items-center my-2">
                <h3 className='text-2xl font-semibold'>Filter</h3>
                {(cnr || cne) && (
                    <span onClick={clearFilter} className="px-4 cursor-pointer py-0 bg-slate-900 text-white flex items-center gap-1 rounded-full">
                        <XIcon className='w-3 h-3' />
                        <span className='text-xs'>Clear</span>
                    </span>
                )}
            </div>
            <hr className='my-4' />

            <div>
                <div className={`flex justify-between items-center my-2 cursor-pointer ${cnr ? 'text-red-800 font-bold' : ''}`} onClick={() => toggleAccordion(setShowConsignors)}>
                    <h4 className="underline capitalize text-xs">By Consignor</h4>
                    <span>{showConsignors ? <ChevronUpIcon className='w-5 h-5' /> : <ChevronDownIcon className='w-5 h-5' />}</span>
                </div>
                {showConsignors && (
                    <div className="transition-all duration-300 ease-in-out">
                        {parties && parties.filter(party => party.is_consignor).map(party => {
                            if (party.cr_bookings.length < 1) return;
                            return (
                                <div
                                    onClick={() => setCnr(cnr === party.id ? '' : party.id)}
                                    key={party.id}
                                    className={`cursor-pointer rounded-full p-2 px-4 flex justify-between items-center my-1 ${party.id === cnr ? 'text-teal-50 bg-teal-600' : 'bg-white hover:bg-gray-200'}`}
                                >
                                    <span className='text-xs font-semibold'>{party.name}</span>
                                    {party.id === cnr && <CircleCheckBig className='w-4 h-4' />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <hr className='my-4' />
            <div>
                <div className={`flex justify-between items-center my-2 cursor-pointer ${cne ? 'text-red-800 font-bold' : ''}`} onClick={() => toggleAccordion(setShowConsignees)}>
                    <h4 className="underline capitalize text-xs">By Consignee (Party)</h4>
                    <span>{showConsignees ? <ChevronUpIcon className='w-5 h-5' /> : <ChevronDownIcon className='w-5 h-5' />}</span>
                </div>
                {showConsignees && (
                    <div className="max-h-96 transition-all duration-300 ease-in-out overflow-y-auto">
                        {parties && parties.filter(party => !party.is_consignor).map(party => {
                            if (party.ce_bookings.length < 1) return;
                            return (
                                <div
                                    onClick={() => setCne(cne === party.id ? '' : party.id)}
                                    key={party.id}
                                    className={`cursor-pointer rounded-full p-2 px-4 flex justify-between items-center my-1 ${party.id === cne ? 'text-teal-50 bg-teal-600' : 'bg-white hover:bg-gray-200'}`}
                                >
                                    <span className='text-xs font-semibold'>{party.name}</span>
                                    {party.id === cne && <CircleCheckBig className='w-4 h-4' />}
                                </div>
                            )
                        }
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
