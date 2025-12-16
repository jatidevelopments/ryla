import { NextIntlClientProvider } from "next-intl";
import { QueryProvider } from "@/components/QueryProvider";

interface IProvidersProps {
    children: React.ReactNode;
}

const Providers = ({ children }: IProvidersProps) => {
    return (
        <NextIntlClientProvider>
            <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
    );
};

export default Providers;
