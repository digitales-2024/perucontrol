"use client";

import { HeaderPage } from "@/components/common/HeaderPage";
import ErrorPage from "@/components/ErrorPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function Error()
{
    return (
        <>
            <HeaderPage
                title="Editar cotización"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/cotizaciones">
                                    Todas las cotizaciones
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/cotizaciones">
                                    {" "}
                                    {/* Simplified href as ID is not available */}
                                    Detalle de cotización
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Editar cotización
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <ErrorPage />
        </>
    );
}
