import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { TabView, TabPanel } from 'primereact/tabview';

import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react'

import ItemsList from './ItemsList';
import ReturnList from './Return/ReturnList';

const index = (props) => {
	const items = [{ label: "Transaction", url: '#' }, { label: "Booking" }];
	const toast = useRef();
	const [bookings, setBookings] = useState([]);
	const [parties, setparties] = useState([]);
	const [returnList, setReturnList] = useState([]);

	const loadData = (params) => {
		loadParties();
		axios.get('/data/bookings', { params })
			.then(res => {
				setBookings(res.data)
			})
			.catch(err => {
				console.log(err.message);
			});
	}


	const loadReturnData = (params) => {
		loadParties();
		axios.get('/data/return/bookings', { params })
			.then(res => {
				setReturnList(res.data)
			})
			.catch(err => {
				console.log(err.message);
			});
	}

	const loadParties = () => {
		axios.get('/master/data/parties/all')
			.then(res => {
				setparties(res.data)
			})
			.catch(err => {
				console.log(err.message);
			});
	}


	useEffect(() => {
		loadData();
		loadReturnData();
	}, [])


	return (
		<AdminLayout
			user={props.auth?.user}
			page="Transactions"
		>
			<Head title='Booking' />
			<div className="w-full flex flex-col gap-4 items-start">
				<BreadCrumb model={items} className='py-2 text-gray-500' />
				<div className="shadow w-full h-full flex flex-col bg-white rounded-lg p-4">
					<div className="card">
						<TabView>
							<TabPanel header="Consignment List">
								<ItemsList parties={parties} bookings={bookings} reload={loadData} toast={toast} {...props} />
							</TabPanel>
							<TabPanel header="Return Consignments">
								<ReturnList parties={parties} bookings={returnList} reload={loadReturnData} toast={toast} {...props} />
							</TabPanel>
						</TabView>
					</div>
				</div>
			</div>
			<Toast ref={toast} />
		</AdminLayout>
	)
}

export default index