'use server';

import { Veracross } from '@/lib/Veracross';

export type AcademicAlert = { person_id: number; alert?: string };

export async function getAcademicAlert(person_id: number) {
  const alerts = await Veracross.Data.Academics.StudentAlerts.read({
    person_id
  });
  return { person_id, alert: alerts.academic_alert || undefined };
}
