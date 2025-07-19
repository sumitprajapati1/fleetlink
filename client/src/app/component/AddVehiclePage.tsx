"use client"
import React, { useState } from 'react';
import { Package } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = 'http://localhost:5000';

interface VehicleFormData {
  name: string;
  capacityKg: string;
  tyres: string;
}

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

interface VehicleType {
  _id: string;
  name: string;
  capacityKg: number;
  tyres: number;
}

const AddVehiclePage: React.FC = () => {
  const [vehicleForm, setVehicleForm] = useState<VehicleFormData>({
    name: '',
    capacityKg: '',
    tyres: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles`);
      const data = await response.json();
      const vehicles = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setVehicles(vehicles);
    } catch (error) {
      setVehicles([]);
    }
  };

  React.useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (): Promise<void> => {
    setLoading(true);
    if (!vehicleForm.name || !vehicleForm.capacityKg || !vehicleForm.tyres) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }
    const capacityKg = parseInt(vehicleForm.capacityKg);
    const tyres = parseInt(vehicleForm.tyres);
    if (isNaN(capacityKg) || capacityKg <= 0) {
      toast.error('Please enter a valid capacity');
      setLoading(false);
      return;
    }
    if (isNaN(tyres) || tyres < 2) {
      toast.error('Please enter a valid number of tyres (minimum 2)');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vehicleForm.name.trim(),
          capacityKg: capacityKg,
          tyres: tyres
        }),
      });
      const data: ApiResponse = await response.json();
      if (response.ok) {
        toast.success('Vehicle added successfully!');
        setVehicleForm({ name: '', capacityKg: '', tyres: '' });
        fetchVehicles(); // Refresh vehicle list
      } else {
        toast.error(data.error || 'Failed to add vehicle');
      }
    } catch (error) {
      toast.error('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleFormChange = (field: keyof VehicleFormData, value: string): void => {
    setVehicleForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl text-black font-semibold mb-6 flex items-center space-x-2">
          <Package size={24} />
          <span>Add New Vehicle</span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
            <input
              type="text"
              required
              value={vehicleForm.name}
              onChange={(e) => handleVehicleFormChange('name', e.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Truck-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (KG)</label>
            <input
              type="number"
              required
              min="1"
              value={vehicleForm.capacityKg}
              onChange={(e) => handleVehicleFormChange('capacityKg', e.target.value)}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tyres</label>
            <input
              type="number"
              required
              min="2"
              value={vehicleForm.tyres}
              onChange={(e) => handleVehicleFormChange('tyres', e.target.value)}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 4"
            />
          </div>
          <button
            onClick={handleAddVehicle}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
          </button>
        </div>
      </div>
      {/* Vehicle List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-black">All Vehicles</h3>
        {vehicles.length === 0 ? (
          <div className="text-gray-500">No vehicles found.</div>
        ) : (
          <div className="space-y-4">
            {vehicles.map(vehicle => (
              <div key={vehicle._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="font-semibold text-black">{vehicle.name}</div>
                <div className="text-sm text-gray-700">Capacity: {vehicle.capacityKg} KG</div>
                <div className="text-sm text-gray-700">Tyres: {vehicle.tyres}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVehiclePage; 