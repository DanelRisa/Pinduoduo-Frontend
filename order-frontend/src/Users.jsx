import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      setError('Please log in to access users.');
    }
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:8081/users', {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setError(`Failed to load users. ${error.message}`);
      if (error.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8081/users/${id}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setSelectedUser(data);
      setEditFormData({
        username: data.username,
        email: data.email,
        password: '',
      });
    } catch (error) {
      setError(`Failed to load user details. ${error.message}`);
      if (error.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id) => {
    if (!id) return setError('Please select a user to update.');

    const updateData = {};
    if (editFormData.username) updateData.username = editFormData.username;
    if (editFormData.email) updateData.email = editFormData.email;
    if (editFormData.password) updateData.password = editFormData.password;

    if (Object.keys(updateData).length === 0) return setError('Provide at least one field to update.');

    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8081/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }
      await res.json();
      setSelectedUser(null);
      setEditFormData({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        setError('Server might be down or there’s a CORS issue.');
      } else {
        setError(`Failed to update user: ${error.message}`);
      }
      if (error.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!id) return setError('Please select a user to delete.');

    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8081/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      setError(`Failed to delete user: ${error.message}`);
      if (error.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-red-600">{error}</p>
        <p>
          You need to log in to access this page.
          <a href="/login" className="text-blue-600 underline"> Go to Login</a>
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>
      {error && <p className="text-red-500 font-medium">{error}</p>}
      {isLoading && <p className="text-gray-600">Loading...</p>}

      <div className="bg-white rounded-xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.ID} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">#{user.ID} - {user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => fetchUser(user.ID)}
                  className="text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  View/Edit
                </button>
                <button
                  onClick={() => deleteUser(user.ID)}
                  className="text-red-600 hover:underline"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedUser && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Edit User #{selectedUser.ID}</h2>

          <div className="space-y-3">
            <input
              className="border p-2 w-full rounded"
              placeholder="New Username"
              type="text"
              value={editFormData.username}
              onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
              disabled={isLoading}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="New Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              disabled={isLoading}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="New Password (optional)"
              type="password"
              value={editFormData.password}
              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              disabled={isLoading}
            />

            <div className="flex gap-2">
              <button
                onClick={() => updateUser(selectedUser.ID)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={isLoading}
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditFormData({ username: '', email: '', password: '' });
                  setError('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
