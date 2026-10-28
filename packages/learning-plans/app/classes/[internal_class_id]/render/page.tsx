import { getAcademicAlert } from '@/actions/getAcademicAlert';
import { Class, getClass } from '@/actions/getClass';
import { getStudents, Student } from '@/actions/getStudents';
import { Loading } from '@/components/Loading';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Container, Table } from 'react-bootstrap';

type Props = PageProps<'/classes/[internal_class_id]/render'>;
type ClassAlerts = Class & { students: (Student & { alert?: string })[] };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<Loading caption="Loading learning plans…" />}>
      <DynamicContent {...props} />
    </Suspense>
  );
}

async function DynamicContent({ params }: Props) {
  await connection();

  const internal_class_ids = (await params).internal_class_id
    .split(/-|_| /)
    .map((id) => parseInt(id));

  const classes: ClassAlerts[] = [];

  await Promise.all(
    internal_class_ids.map(async (internal_class_id) => {
      const [thisClass, students] = await Promise.all([
        (await getClass(internal_class_id)) as ClassAlerts,
        getStudents(internal_class_id)
      ]);

      thisClass.students = [];
      await Promise.all(
        students.map(async ({ person_id, name }) => {
          thisClass.students.push({
            name,
            ...(await getAcademicAlert(person_id))
          });
          return;
        })
      );
      thisClass.students.sort((a, b) => (a.name < b.name ? -1 : 1));
      classes.push(thisClass);
    })
  );

  classes.sort((a, b) => (a.description < b.description ? -1 : 1));
  return (
    <Container>
      <Table striped>
        {classes.map((cls) => (
          <>
            <thead>
              <tr>
                <th colSpan={2}>
                  <h2 className="mt-5">{cls.description}</h2>
                </th>
              </tr>
              <tr>
                <th>Student</th>
                <th>Accommodations</th>
              </tr>
            </thead>
            <tbody>
              {cls.students.map((student) => (
                <tr>
                  <td>{student.name}</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: student.alert || ''
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </>
        ))}
      </Table>
    </Container>
  );
}
