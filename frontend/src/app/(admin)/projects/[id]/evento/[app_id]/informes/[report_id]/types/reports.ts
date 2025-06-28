export const reportTitles: Record<string, string> = {
    "desinsectacion-desratizacion-desinfeccion": "Informe de Desinfección, Desratización y Desinsectación",
    "desinfeccion-desinsectacion": "Informe de Desinfección y Desinsectación",
    "desratizacion": "Informe de Desratización",
    "sostenimiento-desratizacion": "Informe de Sostenimiento de Desratización",
    "sostenimiento-desinsectacion-desratizacion": "Informe de Sostenimiento de Desinsectación y Desratización",
};

// Map report IDs to their corresponding API endpoints
export const reportEndpoints: Record<string, string> = {
    "desinsectacion-desratizacion-desinfeccion": "/api/Appointment/{appointmentid}/CompleteReport",
    "desinfeccion-desinsectacion": "/api/Appointment/{appointmentid}/Disinfection-Desinsect",
    "desratizacion": "/api/Appointment/{appointmentid}/RodenticideReport",
    "sostenimiento-desratizacion": "/api/Appointment/{appointmentid}/RatExterminationSubst",
    "sostenimiento-desinsectacion-desratizacion": "/api/Appointment/{appointmentid}/RatExterminationSubst",
};
