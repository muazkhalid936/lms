import React from 'react';

export default function Profile() {
  const user = {
    firstName: "Ronald",
    lastName: "Richard",
    registrationDate: "16 Jan 2024, 11:15 AM",
    userName: "Studentdemo",
    phoneNumber: "90154-91036",
    email: "studentdemo@gmail.com",
    gender: "Male",
    dob: "16 Jan 2020",
    age: "24",
    bio: "Hello! I'M Ronald Richard. I'm passionate about developing innovative software solutions, analyzing classic literature. I aspire to become a software developer, work as an editor. In my free time, I enjoy coding, reading, hiking etc"
  };

  const ProfileField = ({ label, value, isBio = false }) => (
    <div className={isBio ? "mt-8" : ""}>
      <div className="flex flex-col md:flex-col">
        <h3 style={{ 
          color: 'var(--gray-900)', 
          fontSize: '16px', 
          fontWeight: 'bold',
          marginBottom: isBio ? '8px' : '4px'
        }}>
          {label}
        </h3>
        <p style={{ 
          color: 'var(--gray-600)', 
          fontSize: '13px',
          lineHeight: isBio ? '1.5' : '1.4'
        }}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto px-6 pb-6 bg-white">
      <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-8">My Profile</h1>
      
      <div className=" border border-[var(--gray-100)] rounded-[10px] p-6">
        <h2 className="text-[18px] border-b border-[var(--gray-100)] pb-4 font-semibold text-[var(--gray-900)] mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ProfileField label="First Name" value={user.firstName} />
          <ProfileField label="Last Name" value={user.lastName} />
          <ProfileField label="Registration Date" value={user.registrationDate} />
          
          <ProfileField label="User Name" value={user.userName} />
          <ProfileField label="Phone Number" value={user.phoneNumber} />
          <ProfileField label="Email" value={user.email} />
          
          <ProfileField label="Gender" value={user.gender} />
          <ProfileField label="DOB" value={user.dob} />
          <ProfileField label="Age" value={user.age} />
        </div>
        
        <ProfileField label="Bio" value={user.bio} isBio={true} />
      </div>
    </div>
  );
}