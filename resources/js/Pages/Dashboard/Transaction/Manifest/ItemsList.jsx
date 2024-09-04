import { ConfirmDialog } from 'primereact/confirmdialog';
import React, { useEffect, useState } from 'react'
import DeleteManifest from './DeleteManifest';
import ManifestDetails from './ManifestDetails';


const ItemsList = (props) => {
    const { manifests, reload } = props;
    const [searchTxt, setSearchTxt] = useState('');
    const [perPage, setPerPage] = useState(10);

    const handleLimitChange = (e) => setPerPage(e.target.value);
    const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

    useEffect(() => {
        reload({ per_page: perPage, search: searchTxt });
    }, [perPage, searchTxt]);

    return (
        <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
            <div className="flex justify-between px-2">
                <select value={perPage} onChange={handleLimitChange}>
                    {[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
                <input type="text" placeholder="Search..." onChange={handleSearch} />
            </div>
            <div className="content px-2">
                {manifests && manifests.total > 0 ? (
                    <>
                        <table className="w-full border">
                            <thead>
                                <tr>
                                    <th className="text-center py-3">Sl.</th>
                                    <th className="text-left">Manifest</th>
                                    <th className="text-left">From Location</th>
                                    <th className="text-left">To Location</th>
                                    <th className="text-left">Trip Date</th>
                                    <th className="text-left">Vehicle Number</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {manifests.data.map((manifest, i) => (
                                    <tr key={i} className="border">
                                        <td className='text-center py-2'>{i + (manifests.per_page * (manifests.current_page - 1)) + 1}</td>
                                        <td>{manifest.manifest_no}</td>
                                        <td>{manifest.from_location?.name}</td>
                                        <td>{manifest.to_location?.name}</td>
                                        <td>
                                            {new Date(manifest.trip_date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td>{manifest.lorry?.lorry_number}</td>
                                        <td className="text-center">
                                            <div className="flex gap-4">
                                                <ManifestDetails id={manifest.id} />
                                                <DeleteManifest item={manifest} reload={reload} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination manifests={manifests} reload={reload} perPage={perPage} searchTxt={searchTxt} />
                    </>
                ) : <span>No Item found!</span>}
            </div>

            <ConfirmDialog className="rounded-md bg-white p-4" />
        </div>
    );
}

export default ItemsList

const Pagination = ({ manifests, reload, perPage, searchTxt }) => (
    <div className="flex justify-between p-4">
        <span>Showing {manifests.from} to {manifests.to} of {manifests.total} items</span>
        <ul className="flex gap-3">
            {manifests.links.map((link, index) => {
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