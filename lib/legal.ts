type LegalConfig = {
  publisherName: string;
  businessName: string;
  status: string;
  address: string;
  registration: string;
  contactEmail: string;
  supportEmail: string;
  mediatorName: string;
  mediatorUrl: string;
  hostName: string;
  hostAddress: string;
};

function value(name: string, fallback = "À compléter avant l’ouverture commerciale") {
  return process.env[name]?.trim() || fallback;
}

export function getLegalConfig(): LegalConfig {
  const contactEmail = value("LEGAL_CONTACT_EMAIL", "contact@aptileo.fr");
  return {
    publisherName: value("LEGAL_PUBLISHER_NAME"),
    businessName: value("LEGAL_BUSINESS_NAME", "Aptileo"),
    status: value("LEGAL_STATUS"),
    address: value("LEGAL_ADDRESS"),
    registration: value("LEGAL_REGISTRATION"),
    contactEmail,
    supportEmail: value("LEGAL_SUPPORT_EMAIL", contactEmail),
    mediatorName: value("LEGAL_MEDIATOR_NAME"),
    mediatorUrl: value("LEGAL_MEDIATOR_URL"),
    hostName: value("LEGAL_HOST_NAME", "Vercel Inc."),
    hostAddress: value("LEGAL_HOST_ADDRESS", "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis")
  };
}

export function legalCommerceIsConfigured() {
  const required = [
    "LEGAL_PUBLISHER_NAME",
    "LEGAL_STATUS",
    "LEGAL_ADDRESS",
    "LEGAL_REGISTRATION",
    "LEGAL_CONTACT_EMAIL",
    "LEGAL_MEDIATOR_NAME",
    "LEGAL_MEDIATOR_URL"
  ];
  return required.every((name) => Boolean(process.env[name]?.trim()));
}
