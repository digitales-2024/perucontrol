import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "PeruControl",
    description: "Sistema interno de PeruControl",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>)
{
    return (
        <html lang="es" suppressHydrationWarning>
            <body
                className={"antialiased"}
            >
                <Toaster
                    richColors
                    position="top-center"
                    toastOptions={{
                        style: {
                            background: "#fff",
                            borderBlockColor: "#e2e8f0",
                        },
                    }}
                    closeButton
                />
                {children}
            </body>
        </html>
    );
}
