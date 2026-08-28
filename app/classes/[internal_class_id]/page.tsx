import { Loading } from '#components/Loading';
import { Data } from '#lib/Veracross';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Badge, Button, Container, Table } from 'react-bootstrap';

type PathParameters = { internal_class_id: string };
type Properties = { params: Promise<PathParameters> };

export default function Page(props: Properties) {
  return (
    <Suspense fallback={<Loading caption="Loading learning plans…" />}>
      <DynamicContent {...props} />
    </Suspense>
  );
}

async function DynamicContent({ params }: Properties) {
  await connection();

  const school_year =
    new Date().getMonth() < 6
      ? new Date().getFullYear() - 1
      : new Date().getFullYear();

  const internal_class_ids = (await params).internal_class_id
    .split(/-|_| /)
    .map((id) => parseInt(id));

  const classes = [];

  for (const internal_class_id of internal_class_ids) {
    const [thisClass, enrollments] = await Promise.all([
      Data.Academics.Classes.read(internal_class_id),
      Data.Academics.Enrollments.list({
        query: { internal_class_id, school_year, currently_enrolled: true }
      })
    ]);

    const [, block] = (thisClass.description.match(/\(([A-Z]{2})/) || [
      ,
      'NoColor'
    ]) as ('RD' | 'OR' | 'YL' | 'GR' | 'LB' | 'DB' | 'PR' | 'NoColor')[];

    const alerts = await Promise.all(
      enrollments.map(
        async (enrollment) =>
          await Data.Academics.StudentAlerts.read(enrollment.person_id)
      )
    );

    classes.push({
      ...thisClass,
      block,
      alerts,
      students: enrollments.sort((a, b) =>
        a.person_name < b.person_name ? -1 : 1
      )
    });
  }
  classes.sort((a, b) => (a.description < b.description ? -1 : 1));
  return (
    <Container>
      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Section</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <>
              {cls.students.map((student) => (
                <tr>
                  <td>{student.person_name}</td>
                  <td>{cls.description}</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html:
                        cls.alerts.find(
                          (alert) => alert.id == student.person_id
                        )?.academic_alert || ''
                    }}
                  />
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
