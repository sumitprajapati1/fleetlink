"use client"
import React, { useState } from 'react';
import { Truck } from "lucide-react";
import AddVehiclePage from './AddVehiclePage';
import SearchBookPage from './SearchBookPage';
import BookingListPage from './BookingListPage';

type ActiveTab = 'add' | 'search' | 'booking';

const FleetLinkApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('add');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Truck size={32} />
            <div>
              <h1 className="text-2xl font-bold">FleetLink</h1>
              <p className="text-blue-200">Logistics Vehicle Booking System</p>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'add'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Add Vehicle
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Search & Book
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'booking'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Booking
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'add' && <AddVehiclePage />}
        {activeTab === 'search' && <SearchBookPage />}
        {activeTab === 'booking' && <BookingListPage />}
      </div>
    </div>
  );
};

export default FleetLinkApp;