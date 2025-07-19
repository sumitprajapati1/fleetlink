"use client"
import React, { useState } from 'react';
import { Truck, Clock, Package, Users } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = 'http://localhost:5000';

interface AvailableVehicle {
  _id: string;
  name: string;
  capacityKg: number;
  tyres: number;
  estimatedRideDurationHours: number;
}

interface SearchFormData {
  capacityRequired: string;
  fromPincode: string;
  toPincode: string;
  startTime: string;
}

interface BookingRequest {
  vehicleId: string;
  fromPincode: string;
  toPincode: string;
  startTime: string;
  customerId: string;
}

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

const SearchBookPage: React.FC = () => {
  const [searchForm, setSearchForm] = useState<SearchFormData>({
    capacityRequired: '',
    fromPincode: '',
    toPincode: '',
    startTime: ''
  });
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearchVehicles = async (): Promise<void> => {
    setLoading(true);
    if (!searchForm.capacityRequired || !searchForm.fromPincode || !searchForm.toPincode || !searchForm.startTime) {
      toast.error('Please fill in all search fields');
      setLoading(false);
      return;
    }
    const capacityRequired = parseInt(searchForm.capacityRequired);
    if (isNaN(capacityRequired) || capacityRequired <= 0) {
      toast.error('Please enter a valid capacity requirement');
      setLoading(false);
      return;
    }
    const startTime = new Date(searchForm.startTime);
    if (isNaN(startTime.getTime())) {
      toast.error('Please enter a valid start time');
      setLoading(false);
      return;
    }
    if (startTime < new Date()) {
      toast.error('Start time cannot be in the past');
      setLoading(false);
      return;
    }
    try {
      const queryParams = new URLSearchParams({
        capacityRequired: capacityRequired.toString(),
        fromPincode: searchForm.fromPincode.trim(),
        toPincode: searchForm.toPincode.trim(),
        startTime: startTime.toISOString()
      });
      const response = await fetch(`${API_BASE_URL}/api/vehicles/available?${queryParams}`);
      const data = await response.json();
      const vehicles = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      if (response.ok) {
        setAvailableVehicles(vehicles);
        setShowResults(true);
        if (vehicles.length === 0) {
          toast.info('No available vehicles found for the specified criteria.');
        } else {
          toast.success(`Found ${vehicles.length} available vehicle(s)!`);
        }
      } else {
        toast.error(data.error || 'Failed to search vehicles');
        setAvailableVehicles([]);
      }
    } catch (error) {
      toast.error('Network error. Please check if the backend is running.');
      setAvailableVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshSearch = async (): Promise<void> => {
    if (!searchForm.capacityRequired || !searchForm.fromPincode || !searchForm.toPincode || !searchForm.startTime) {
      return;
    }
    try {
      const capacityRequired = parseInt(searchForm.capacityRequired);
      const startTime = new Date(searchForm.startTime);
      const queryParams = new URLSearchParams({
        capacityRequired: capacityRequired.toString(),
        fromPincode: searchForm.fromPincode.trim(),
        toPincode: searchForm.toPincode.trim(),
        startTime: startTime.toISOString()
      });
      const response = await fetch(`${API_BASE_URL}/api/vehicles/available?${queryParams}`);
      const data: AvailableVehicle[] = await response.json();
      if (response.ok) {
        setAvailableVehicles(data);
      }
    } catch (error) {
      // ignore
    }
  };

  const handleBookVehicle = async (vehicleId: string): Promise<void> => {
    setLoading(true);
    try {
      const bookingData: BookingRequest = {
        vehicleId: vehicleId,
        fromPincode: searchForm.fromPincode.trim(),
        toPincode: searchForm.toPincode.trim(),
        startTime: new Date(searchForm.startTime).toISOString(),
        customerId: 'customer-123'
      };
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const data: ApiResponse = await response.json();
      if (response.ok) {
        toast.success('Vehicle booked successfully!');
        await refreshSearch();
      } else if (response.status === 409) {
        toast.error('Vehicle became unavailable. Please search again.');
        await refreshSearch();
      } else if (response.status === 404) {
        toast.error('Vehicle not found.');
      } else {
        toast.error(data.error || 'Failed to book vehicle');
      }
    } catch (error) {
      toast.error('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFormChange = (field: keyof SearchFormData, value: string): void => {
    setSearchForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl text-black font-bold mb-6 flex items-center space-x-2">
          <Users size={24} />
          <span>Search Available Vehicles</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Required (KG)</label>
            <input
              type="number"
              required
              min="1"
              value={searchForm.capacityRequired}
              onChange={(e) => handleSearchFormChange('capacityRequired', e.target.value)}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Pincode</label>
            <input
              type="text"
              required
              value={searchForm.fromPincode}
              onChange={(e) => handleSearchFormChange('fromPincode', e.target.value)}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 110001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Pincode</label>
            <input
              type="text"
              required
              value={searchForm.toPincode}
              onChange={(e) => handleSearchFormChange('toPincode', e.target.value)}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 400001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              required
              value={searchForm.startTime}
              onChange={(e) => handleSearchFormChange('startTime', e.target.value)}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <button
              onClick={handleSearchVehicles}
              disabled={loading}
              className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Availability'}
            </button>
          </div>
        </div>
      </div>
      {showResults && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg text-black font-semibold mb-4">Available Vehicles</h3>
          {Array.isArray(availableVehicles) && availableVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck size={48} className="mx-auto mb-4 opacity-50" />
              <p>No vehicles available for the specified criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(availableVehicles) && availableVehicles.map((vehicle: AvailableVehicle) => (
                <div key={vehicle._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-black text-lg">{vehicle.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <div className="flex items-center space-x-2">
                          <Package size={16} />
                          <span>Capacity: {vehicle.capacityKg} KG</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={16} />
                          <span>Tyres: {vehicle.tyres}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={16} />
                          <span>Est. Duration: {vehicle.estimatedRideDurationHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookVehicle(vehicle._id)}
                    disabled={loading}
                    className="w-fit bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Booking...' : 'Book'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBookPage; 