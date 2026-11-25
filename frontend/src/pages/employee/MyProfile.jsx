import ProfileDetails from '../../components/ProfileDetails';
import { useAuth } from '../../context/AuthContext';

export default function MyProfile() {
  const { user } = useAuth();
  return (
    <>
      <div className="page-head"><div><h1>My Profile</h1><p>Your details as recorded by HR. This page is read-only.</p></div></div>
      {user.employee ? <ProfileDetails employee={user.employee} /> : <div className="card empty"><h4>No employee record linked</h4><p>Ask HR to link your account to an employee profile.</p></div>}
    </>
  );
}
