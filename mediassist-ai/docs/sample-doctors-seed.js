// This is a sample script to add doctors with different specializations
// Run this in Prisma Studio or your database console to test the functionality

const doctorSeedData = [
  {
    email: "dr.sarah.cardio@mediassist.ai",
    name: "Dr. Sarah Johnson",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-CARD-2023-001",
      specialization: ["Cardiology"],
      yearsOfExperience: 12,
      consultationFee: 150,
      hospitalAffiliation: "City General Hospital",
      qualifications: ["MD", "Board Certified Cardiologist"],
      languagesSpoken: ["English", "Spanish"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.michael.general@mediassist.ai", 
    name: "Dr. Michael Chen",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-GEN-2023-002",
      specialization: ["General Practice"],
      yearsOfExperience: 8,
      consultationFee: 100,
      hospitalAffiliation: "Community Health Center",
      qualifications: ["MD", "Family Medicine"],
      languagesSpoken: ["English", "Mandarin"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.emily.pediatric@mediassist.ai",
    name: "Dr. Emily Rodriguez", 
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-PED-2023-003",
      specialization: ["Pediatrics"],
      yearsOfExperience: 10,
      consultationFee: 120,
      hospitalAffiliation: "Children's Medical Center",
      qualifications: ["MD", "Board Certified Pediatrician"],
      languagesSpoken: ["English", "Spanish"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.james.ortho@mediassist.ai",
    name: "Dr. James Wilson",
    role: "DOCTOR", 
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-ORTH-2023-004",
      specialization: ["Orthopedics"],
      yearsOfExperience: 15,
      consultationFee: 180,
      hospitalAffiliation: "Sports Medicine Institute", 
      qualifications: ["MD", "Orthopedic Surgery", "Sports Medicine"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.lisa.neuro@mediassist.ai",
    name: "Dr. Lisa Anderson",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-NEUR-2023-005", 
      specialization: ["Neurology"],
      yearsOfExperience: 14,
      consultationFee: 200,
      hospitalAffiliation: "Neuroscience Center",
      qualifications: ["MD", "PhD Neuroscience", "Board Certified Neurologist"],
      languagesSpoken: ["English", "German"],
      isAvailable: true,
      isVerified: true
    }
  }
]

// Example of what "No doctors available" looks like:
// If you select "Dermatology" and no doctors have that specialization,
// the system will show "No doctors available for Dermatology specialization"

console.log('Sample doctor data for testing specialization filtering:')
console.log(JSON.stringify(doctorSeedData, null, 2))