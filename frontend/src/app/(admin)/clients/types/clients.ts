export type Client = {
    id: string;
    typeDocument: string;
    typeDocumentValue: string;
    razonSocial: string;
    businessType: string;
    name: string;
    fiscalAddress: string;
    email: string;
    contactName: string;
    phoneNumber: string;
    clientLocations: Array<{
        address: string;
    }>;
}
