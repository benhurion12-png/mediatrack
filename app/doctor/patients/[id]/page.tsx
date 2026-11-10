import { MediaTrackPage } from "@/components/media-track-app";
import { initialPatients } from "@/lib/data";

export function generateStaticParams() {
  return initialPatients.map((patient) => ({ id: patient.id }));
}

export default async function DoctorPatientPage({ params }: PageProps<"/doctor/patients/[id]">) {
  const { id } = await params;
  return <MediaTrackPage view="doctor-patient" patientId={id} />;
}
