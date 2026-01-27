import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface ClubData {
  clubName: string;
  address: string;
  city: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
}

const ClubDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [clubData, setClubData] = useState<ClubData | null>(null);

  useEffect(() => {
    if (currentUser) {
      const clubRef = ref(db, 'clubs/' + currentUser.uid);
      const unsubscribe = onValue(clubRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setClubData(data);
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  return (
    <div>
      <h2>Club Dashboard</h2>
      {clubData ? (
        <div>
          <h3>Welcome, {clubData.clubName}!</h3>
          <p><strong>Address:</strong> {clubData.address}</p>
          <p><strong>City:</strong> {clubData.city}</p>
          <p><strong>State:</strong> {clubData.state}</p>
          <p><strong>Email:</strong> {clubData.contactEmail}</p>
          <p><strong>Phone:</strong> {clubData.contactPhone}</p>
        </div>
      ) : (
        <p>Loading club information...</p>
      )}
    </div>
  );
};

export default ClubDashboard;