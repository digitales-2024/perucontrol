import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import CertificationList from "./_components/ViewCertificate";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export default async function ProjectDetail()
{
    // Get certificates in table
    const [certificatesForTable, certificatesForTableErr] = await wrapper((auth) => backend.GET("/api/Certificate/for-table", auth));
    if (certificatesForTableErr)
    {
        console.error(`error ${certificatesForTableErr.message}`);
        throw certificatesForTableErr;
    }

    const [certificatesForCreation, certificatesForCreationErr] = await wrapper((auth) => backend.GET("/api/Certificate/for-creation", auth));
    if (certificatesForCreationErr)
    {
        console.error(`error ${certificatesForCreationErr.message}`);
        throw certificatesForCreationErr;
    }

    return (
        <>
            <HeaderPage
                title={"Lista de Certificados"}
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects/tablas/fichas">
                                    Todas las Fichas de Operacion
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <CertificationList data={certificatesForTable} availableForCreation={certificatesForCreation} />
        </>
    );
}
