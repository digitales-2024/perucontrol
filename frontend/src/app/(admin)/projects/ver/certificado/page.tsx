import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { columns } from "./_components/CertificateColumns";
import CertificationList from "./_components/ViewCertificate";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export default async function ProjectDetail()
{
    // Obtener todos los certificados
    const [ProjectsOperationSheet, err] = await wrapper((auth) => backend.GET("/api/Appointment/allCertificates", auth));
    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

    return (
        <>
            <HeaderPage
                title={"Lista de Certificados"}
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects/ver/certificado">
                                    Todas las Fichas de Operaciones
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <CertificationList columns={columns} data={ProjectsOperationSheet} />
        </>
    );
}
