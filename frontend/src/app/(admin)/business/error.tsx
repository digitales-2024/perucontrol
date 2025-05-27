"use client";

import { HeaderPage } from "@/components/common/HeaderPage";
import ErrorPage from "@/components/ErrorPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export default function Error()
{
    return (
        <>
            <HeaderPage
                title="Información de PeruControl"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/business">
                                    Información de la empresa
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <ErrorPage />
        </>
    );
}
