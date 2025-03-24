import type { Metadata } from "next";
// import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

/* const atkinsonHyperlegible = Atkinson_Hyperlegible({
    variable: "--font-atkinson",
    weight: ["400", "700"],
    subsets: ["latin"],
}); */

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
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
