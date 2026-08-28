import { APIResponse, client } from '../Client';

export type StudentAlert = APIResponse<'read_academics_student_alerts'>;

export async function read(person_id: number) {
  const { data, error } = await client.GET(
    '/academics/student_alerts/{person_id}',
    { params: { path: { person_id } } }
  );
  if (error) {
    throw new Error('Could not read alerts', { cause: error });
  }
  return data.data;
}
