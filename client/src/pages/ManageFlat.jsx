import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlats, createFlat, updateFlat, deleteFlat } from '../redux/slice/flatSlice';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Dialog, Input, Spinner } from '../component/ui';
import { Home, Search, Edit2, Trash2 } from 'lucide-react';

function ManageFlat() {
  const dispatch = useDispatch();
  const { flats, loading } = useSelector((state) => state.flat);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFlatId, setEditFlatId] = useState(null);
  const [formData, setFormData] = useState({
    flatNumber: '',
    block: '',
    floor: '',
  });

  useEffect(() => {
    dispatch(fetchFlats());
  }, [dispatch]);

  const filteredFlats = flats.filter((flat) => {
    const blockMatch = flat.block?.toLowerCase().includes(searchTerm.toLowerCase());
    const numberMatch = flat.flatNumber?.toString().includes(searchTerm);
    return blockMatch || numberMatch;
  });

  const handleOpenDialog = (flat = null) => {
    if (flat) {
      setEditFlatId(flat._id);
      setFormData({
        flatNumber: flat.flatNumber || '',
        block: flat.block || '',
        floor: flat.floor || '',
      });
    } else {
      setEditFlatId(null);
      setFormData({ flatNumber: '', block: '', floor: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const flatData = {
      flatNumber: Number(formData.flatNumber),
      block: formData.block,
      floor: Number(formData.floor),
    };
    if (editFlatId) {
      dispatch(updateFlat({ id: editFlatId, flatData })).then(() => dispatch(fetchFlats()));
    } else {
      dispatch(createFlat(flatData)).then(() => dispatch(fetchFlats()));
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this flat?')) {
      dispatch(deleteFlat(id)).then(() => dispatch(fetchFlats()));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Flats</h1>
          <p className="text-slate-500 text-sm">View and manage all society flats.</p>
        </div>
        <Button 
          leftIcon={<Home size={18} />} 
          onClick={() => handleOpenDialog()}
        >
          Add New Flat
        </Button>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by block or flat number..."
            className="w-full has-icon pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Flats Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <Spinner size="md" />
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>Flat Number</Th>
                <Th>Block</Th>
                <Th>Floor</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFlats.length > 0 ? (
                filteredFlats.map((flat) => (
                  <Tr key={flat._id}>
                    <Td className="font-medium text-slate-900">{flat.flatNumber}</Td>
                    <Td className="uppercase">{flat.block}</Td>
                    <Td>{flat.floor}</Td>
                    <Td>
                      <Badge variant={flat.isOccupied ? 'success' : 'slate'}>
                        {flat.isOccupied ? 'Occupied' : 'Vacant'}
                      </Badge>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDialog(flat)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                          title="Edit Flat"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(flat._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Flat"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={5} className="text-center py-12 text-slate-500">
                    No flats found matching your search.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Add/Edit Flat Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editFlatId ? "Edit Flat" : "Add New Flat"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editFlatId ? "Update Flat" : "Create Flat"}</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Flat Number" 
              type="number"
              placeholder="101" 
              name="flatNumber"
              value={formData.flatNumber}
              onChange={handleChange}
            />
            <Input 
              label="Block" 
              placeholder="A" 
              name="block"
              value={formData.block}
              onChange={handleChange}
            />
          </div>
          <Input 
            label="Floor" 
            type="number"
            placeholder="1" 
            name="floor"
            value={formData.floor}
            onChange={handleChange}
          />
        </div>
      </Dialog>
    </div>
  );
}

export default ManageFlat;
