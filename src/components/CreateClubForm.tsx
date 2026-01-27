import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';

const states = [
  'Abu Dhabi', 'Sharjah', 'Dubai', 'Ajman'
];

const CreateClubForm: React.FC = () => {
  const [clubName, setClubName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(states[0]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, contactEmail, 'defaultpassword');
      const user = userCredential.user;

      // Save club data to Realtime Database
      await set(ref(db, 'clubs/' + user.uid), {
        clubName,
        address,
        city,
        state,
        contactEmail,
        contactPhone,
        role: 'club'
      });

      setSuccess('Club created successfully!');
      // Clear form
      setClubName('');
      setAddress('');
      setCity('');
      setState(states[0]);
      setContactEmail('');
      setContactPhone('');
    } catch (err) {
      setError('Failed to create club. Please try again.');
    }
  };

  return (
    <div>
      <h3>Create a New Club</h3>
      <form onSubmit={handleCreateClub}>
        <input
          type="text"
          placeholder="Club Name"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <select value={state} onChange={(e) => setState(e.target.value)} required>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="email"
          placeholder="Contact Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Contact Phone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          required
        />
        <button type="submit">Create Club</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  );
};

export default CreateClubForm;