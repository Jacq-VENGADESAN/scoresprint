type LegalConfig = {
  publisherName: string;
  businessName: string;
  status: string;
  address: string;
  siren: string;
  siret: string;
  apeCode: string;
  vatNumber: string;
  registration: string;
  contactEmail: string;
  supportEmail: string;
  phone: string;
  mediatorName: string;
  mediatorUrl: string;
  mediatorAddress: string;
  hostName: string;
  hostAddress: string;
};

const PLACEHOLDER = "À compléter avant l’ouverture commerciale";

function value(name: string, fallback = PLACEHOLDER) {
  return process.env[name]?.trim() || fallback;
}

function optionalValue(name: string) {
  return process.env[name]?.trim() || "Non applicable ou non communiqué";
}

export function getLegalConfig(): LegalConfig {
  const contactEmail = value("LEGAL_CONTACT_EMAIL", "contact@aptileo.fr");
  const siren = value("LEGAL_SIREN", process.env.LEGAL_REGISTRATION?.trim() || PLACEHOLDER);
  const siret = value("LEGAL_SIRET", process.env.LEGAL_REGISTRATION?.trim() || PLACEHOLDER);
  return {
    publisherName: value("LEGAL_PUBLISHER_NAME"),
    businessName: value("LEGAL_BUSINESS_NAME", "Aptileo"),
    status: value("LEGAL_STATUS"),
    address: value("LEGAL_ADDRESS"),
    siren,
    siret,
    apeCode: optionalValue("LEGAL_APE_CODE"),
    vatNumber: optionalValue("LEGAL_VAT_NUMBER"),
    registration: value("LEGAL_REGISTRATION", `SIREN ${siren} · SIRET ${siret}`),
    contactEmail,
    supportEmail: value("LEGAL_SUPPORT_EMAIL", contactEmail),
    phone: value("LEGAL_PHONE"),
    mediatorName: value("LEGAL_MEDIATOR_NAME"),
    mediatorUrl: value("LEGAL_MEDIATOR_URL"),
    mediatorAddress: value("LEGAL_MEDIATOR_ADDRESS"),
    hostName: value("LEGAL_HOST_NAME", "Vercel Inc."),
    hostAddress: value("LEGAL_HOST_ADDRESS", "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis")
  };
}

export function legalCommerceIsConfigured() {
  const identityReady = Boolean(
    process.env.LEGAL_SIREN?.trim()
    && process.env.LEGAL_SIRET?.trim()
  ) || Boolean(process.env.LEGAL_REGISTRATION?.trim());
  const required = [
    "LEGAL_PUBLISHER_NAME",
    "LEGAL_STATUS",
    "LEGAL_ADDRESS",
    "LEGAL_CONTACT_EMAIL",
    "LEGAL_PHONE",
    "LEGAL_MEDIATOR_NAME",
    "LEGAL_MEDIATOR_URL",
    "LEGAL_MEDIATOR_ADDRESS"
  ];
  return identityReady && required.every((name) => Boolean(process.env[name]?.trim()));
}
