'use server';

import { current_school_year } from '@/lib/current_school_year';
import { Veracross } from '@/lib/Veracross';

export type Student = { person_id: number; name: string };

export async function getStudents(internal_class_id: number) {
  const enrollments = await Veracross.Data.Academics.Enrollments.list({
    query: {
      internal_class_id,
      school_year: current_school_year(),
      currently_enrolled: true
    }
  });

  return enrollments.map(({ person_id, person_name }) => ({
    person_id,
    name: person_name
  }));
}
