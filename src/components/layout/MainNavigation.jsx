import { useAuth } from '../../context/AuthContext';

const MainNavigation = () => {
  const { currentUser } = useAuth();
  
  // Role-based navigation items
  const getNavItems = () => {
    if (currentUser?.role === 'admin') {
      return [
        { to: '/admin/doctor-verification', label: 'Doctor Verification' },
        // Add other admin navigation items here
      ];
    } else if (currentUser?.role === 'doctor') {
      return [
        { to: '/doctor/dashboard', label: 'Dashboard' },
        { to: '/doctor/appointments', label: 'Appointments' },
        { to: '/doctor/patients', label: 'My Patients' },
        { to: '/doctor/availability', label: 'Manage Availability' },
        { to: '/doctor/profile', label: 'Profile' }
      ];
    } else {
      return [
        { to: '/', label: 'Home' },
        { to: '/find-doctor', label: 'Find Doctor' },
        { to: '/appointments', label: 'My Appointments' },
        { to: '/prescriptions', label: 'Prescriptions' },
        { to: '/medical-records', label: 'Medical Records' }
      ];
    }
  };
  
  const navItems = getNavItems();
  
  return (
    <nav>
      {/* Nav rendering code */}
      <ul>
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink to={item.to}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};