"use client";

import { HeaderPage } from "@/components/common/HeaderPage";
import ErrorPage from "@/components/ErrorPage";

export default function Error()
{
    return (
        <>
            <HeaderPage
                title="Inicio"
            />
            <ErrorPage />
        </>
    );
}
