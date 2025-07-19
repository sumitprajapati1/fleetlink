import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
const API_BASE_URL = 'http://localhost:5000';

interface Vehicle {
  _id: string;
  name: string;
  capacityKg: number;
  tyres: number;
}

interface Booking {
  _id: string;
  vehicleId: Vehicle | string;
  customerId: string;
  fromPincode: string;
  toPincode: string;
  startTime: string;
  endTime: string;
  estimatedRideDurationHours: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const BookingListPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchBookings = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings?page=${pageNum}&limit=${limit}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
      setBookings(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
    // eslint-disable-next-line
  }, [page]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');
      setSuccess('Booking cancelled successfully.');
      toast.success('Booking cancelled successfully.');
      fetchBookings(page);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, color: 'black',  margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2>Bookings</h2>
      {loading && <p>Loading...</p>}
      {/* Toasts will show for error/success, so remove inline error/success messages */}
      <table style={{ width: '100%',borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 8, border: '1px solid #eee' }}>Vehicle</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>Customer ID</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>From</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>To</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>Start</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>End</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
            <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 && !loading && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: 16 }}>No bookings found.</td>
            </tr>
          )}
          {bookings.map((b) => (
            <tr key={b._id}>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{typeof b.vehicleId === 'object' && b.vehicleId !== null ? (b.vehicleId as Vehicle).name : b.vehicleId}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{b.customerId}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{b.fromPincode}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{b.toPincode}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{new Date(b.startTime).toLocaleString()}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{new Date(b.endTime).toLocaleString()}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{b.status}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>
                {b.status === 'BOOKED' ? (
                  <button onClick={() => handleCancel(b._id)} style={{ color: '#fff', background: '#d32f2f', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>Cancel</button>
                ) : (
                  <span style={{ color: '#888' }}>-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && pagination.pages > 1 && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ marginRight: 8, padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: page === 1 ? '#eee' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: page === pagination.pages ? '#eee' : '#fff', cursor: page === pagination.pages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingListPage; 