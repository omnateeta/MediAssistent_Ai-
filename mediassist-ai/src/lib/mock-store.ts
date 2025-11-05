type MockAppointment = {
	id: string
	patientId: string
	doctorId: string
	scheduledDate: string
	status: string
	chiefComplaint?: string
	patient?: { user?: { name?: string; email?: string } }
	doctor?: { user?: { name?: string; email?: string } }
}

type MockPatientProfile = {
	id: string
	userId: string
	user?: { name?: string; email?: string }
}

type MockDoctorProfile = {
	id: string
	userId: string
	user?: { name?: string; email?: string }
}

const store = globalThis as unknown as {
	__mockAppointments?: MockAppointment[]
	__mockPatients?: MockPatientProfile[]
	__mockDoctors?: MockDoctorProfile[]
}

if (!store.__mockAppointments) store.__mockAppointments = []
if (!store.__mockPatients) store.__mockPatients = []
if (!store.__mockDoctors) store.__mockDoctors = []

export const mockAppointments = store.__mockAppointments!
export const mockPatients = store.__mockPatients!
export const mockDoctors = store.__mockDoctors!

export function ensureMockPatient(userId: string, name?: string, email?: string): MockPatientProfile {
	let p = mockPatients.find(p => p.userId === userId)
	if (!p) {
		p = { id: `patient_${Date.now()}`, userId, user: { name, email } }
		mockPatients.push(p)
	}
	return p
}

export function ensureMockDoctor(userId: string, name?: string, email?: string): MockDoctorProfile {
	let d = mockDoctors.find(d => d.userId === userId)
	if (!d) {
		d = { id: `doctor_${Date.now()}`, userId, user: { name, email } }
		mockDoctors.push(d)
	}
	return d
}

export function addMockAppointment(a: Omit<MockAppointment, 'id' | 'status'> & { status?: string }): MockAppointment {
	const appt: MockAppointment = {
		id: `appt_${Date.now()}`,
		status: a.status ?? 'SCHEDULED',
		patientId: a.patientId,
		doctorId: a.doctorId,
		scheduledDate: a.scheduledDate,
		chiefComplaint: a.chiefComplaint,
		patient: a.patient,
		doctor: a.doctor,
	}
	mockAppointments.push(appt)
	return appt
}



