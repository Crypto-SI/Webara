export type StatusTone =
  | 'not_started'
  | 'in_progress'
  | 'received'
  | 'approved'
  | 'expired'
  | 'done'
  | 'overdue'
  | 'planned';

export const moveDate = '2026-08-24';

export const familyMembers = [
  {
    id: 'fm-1',
    fullName: 'Kwame Mensah',
    relationship: 'Parent',
    dateOfBirth: '1987-01-19',
    notes: 'Primary applicant. Handles legal and shipping coordination.',
  },
  {
    id: 'fm-2',
    fullName: 'Ama Mensah',
    relationship: 'Parent',
    dateOfBirth: '1989-09-14',
    notes: 'Leads schooling and healthcare setup.',
  },
  {
    id: 'fm-3',
    fullName: 'Nana Mensah',
    relationship: 'Child',
    dateOfBirth: '2014-05-27',
    notes: 'Year 7 equivalent.',
  },
  {
    id: 'fm-4',
    fullName: 'Adwoa Mensah',
    relationship: 'Child',
    dateOfBirth: '2017-11-03',
    notes: 'Needs updated vaccination records for school.',
  },
];

export const documents = [
  {
    id: 'doc-1',
    person: 'Kwame Mensah',
    documentType: 'Passport',
    status: 'approved',
    issueDate: '2024-02-14',
    expiryDate: '2034-02-14',
    referenceNumber: 'GH-PAS-8832',
    originalAvailable: true,
    copyAvailable: true,
    notes: 'Stored in fireproof folder.',
  },
  {
    id: 'doc-2',
    person: 'Ama Mensah',
    documentType: 'Visa',
    status: 'in_progress',
    issueDate: '2026-03-20',
    expiryDate: '2027-03-20',
    referenceNumber: 'VISA-AMA-2026',
    originalAvailable: false,
    copyAvailable: true,
    notes: 'Awaiting biometric appointment confirmation.',
  },
  {
    id: 'doc-3',
    person: 'Nana Mensah',
    documentType: 'Birth Certificate',
    status: 'received',
    issueDate: '2014-06-02',
    expiryDate: '-',
    referenceNumber: 'BC-NANA-4874',
    originalAvailable: true,
    copyAvailable: true,
    notes: 'Certified copy ordered.',
  },
  {
    id: 'doc-4',
    person: 'Adwoa Mensah',
    documentType: 'CRB Document',
    status: 'not_started',
    issueDate: '-',
    expiryDate: '-',
    referenceNumber: '-',
    originalAvailable: false,
    copyAvailable: false,
    notes: 'To request after school admissions shortlist.',
  },
];

export const timelineTasks = [
  {
    id: 'tl-1',
    title: 'Passports complete',
    category: 'Documents',
    dueDate: '2026-04-20',
    status: 'done',
    priority: 'High',
    assignedPerson: 'Kwame Mensah',
    notes: 'All family passports renewed.',
  },
  {
    id: 'tl-2',
    title: 'Visas submitted',
    category: 'Documents',
    dueDate: '2026-05-02',
    status: 'in_progress',
    priority: 'High',
    assignedPerson: 'Ama Mensah',
    notes: 'Children documents uploaded, waiting final review.',
  },
  {
    id: 'tl-3',
    title: 'Flights booked',
    category: 'Travel',
    dueDate: '2026-05-12',
    status: 'not_started',
    priority: 'Medium',
    assignedPerson: 'Kwame Mensah',
    notes: 'Compare 3 airlines and baggage rules.',
  },
  {
    id: 'tl-4',
    title: 'Shipping booked',
    category: 'Shipping',
    dueDate: '2026-05-30',
    status: 'in_progress',
    priority: 'High',
    assignedPerson: 'Kwame Mensah',
    notes: 'Shortlisted two companies.',
  },
  {
    id: 'tl-5',
    title: 'Housing secured',
    category: 'Housing',
    dueDate: '2026-06-15',
    status: 'not_started',
    priority: 'High',
    assignedPerson: 'Ama Mensah',
    notes: 'Target East Legon and Airport Residential.',
  },
  {
    id: 'tl-6',
    title: 'School selected',
    category: 'Schooling',
    dueDate: '2026-06-05',
    status: 'overdue',
    priority: 'High',
    assignedPerson: 'Ama Mensah',
    notes: 'Need final interview date for Nana.',
  },
  {
    id: 'tl-7',
    title: 'Healthcare arranged',
    category: 'Healthcare',
    dueDate: '2026-06-28',
    status: 'not_started',
    priority: 'Medium',
    assignedPerson: 'Ama Mensah',
    notes: 'Confirm family practice and pediatrician.',
  },
  {
    id: 'tl-8',
    title: 'Final packing complete',
    category: 'Inventory',
    dueDate: '2026-08-20',
    status: 'planned',
    priority: 'Medium',
    assignedPerson: 'All',
    notes: 'Final checklist signoff required.',
  },
];

export const shippingQuotes = [
  {
    id: 'ship-1',
    companyName: 'Atlantic Relocation Co.',
    contactName: 'Daniel Ofori',
    phone: '+233 24 111 3221',
    email: 'daniel@atlanticrelocate.com',
    quoteAmount: 6800,
    currency: 'USD',
    collectionDate: '2026-07-10',
    estimatedDeliveryDate: '2026-08-18',
    shipmentType: 'Door-to-door',
    includedServices: 'Packing, customs support, final delivery',
    insuranceIncluded: true,
    notes: 'Strong support score, slightly higher fee.',
    bestValue: true,
  },
  {
    id: 'ship-2',
    companyName: 'Harbor Freight Movers',
    contactName: 'Linda Sarpong',
    phone: '+44 20 7112 0981',
    email: 'linda@harbormovers.co.uk',
    quoteAmount: 5900,
    currency: 'USD',
    collectionDate: '2026-07-08',
    estimatedDeliveryDate: '2026-08-29',
    shipmentType: 'Port-only',
    includedServices: 'Crating and sea freight only',
    insuranceIncluded: false,
    notes: 'Lower upfront cost but local clearing not included.',
    bestValue: false,
  },
];

export const housingOptions = [
  {
    id: 'house-1',
    propertyTitle: '3-bed family home, East Legon',
    rent: 2200,
    currency: 'USD',
    location: 'East Legon, Accra',
    postcode: 'GL-204-6587',
    numberOfRooms: 3,
    advertLink: 'https://example.com/east-legon-home',
    landlordOrAgentName: 'Afi Realty Group',
    contactDetails: '+233 54 227 1198',
    depositAmount: 4400,
    furnishedStatus: 'Semi furnished',
    distanceToSchool: '2.1 km',
    distanceToHospital: '3.4 km',
    viewed: true,
    shortlisted: true,
    decisionStatus: 'Pending',
    notes: 'Quiet street, solid school access.',
  },
  {
    id: 'house-2',
    propertyTitle: '4-bed townhouse, Airport Residential',
    rent: 3100,
    currency: 'USD',
    location: 'Airport Residential, Accra',
    postcode: 'AR-310-1109',
    numberOfRooms: 4,
    advertLink: 'https://example.com/airport-townhouse',
    landlordOrAgentName: 'Prime Ghana Lets',
    contactDetails: '+233 26 511 8434',
    depositAmount: 6200,
    furnishedStatus: 'Unfurnished',
    distanceToSchool: '4.0 km',
    distanceToHospital: '1.8 km',
    viewed: false,
    shortlisted: false,
    decisionStatus: 'Reviewing',
    notes: 'Larger space, premium location.',
  },
];

export const inventoryRooms = [
  'Main Bedroom',
  "Children's Bedroom",
  'Kitchen',
  'Living Room',
  'Bathroom',
  'Office',
  'Storage',
  'Travel Essentials',
];

export const inventoryItems = [
  { id: 'inv-1', room: 'Main Bedroom', itemName: 'Bed linen set', quantity: 3, status: 'present', notes: 'Vacuum packed for humidity.' },
  { id: 'inv-2', room: "Children's Bedroom", itemName: 'Study desks', quantity: 2, status: 'required', notes: 'Need compact foldable versions.' },
  { id: 'inv-3', room: 'Kitchen', itemName: 'Air fryer', quantity: 1, status: 'will purchase in country', notes: 'Prefer 220V local model.' },
  { id: 'inv-4', room: 'Travel Essentials', itemName: 'Document pouch', quantity: 1, status: 'present', notes: 'Carry-on only.' },
];

export const schoolEntries = [
  {
    id: 'sch-1',
    childName: 'Nana Mensah',
    schoolName: 'Lincoln Community School',
    address: '126 Jungle Rd, East Legon, Accra',
    contactName: 'Admissions Office',
    contactDetails: 'admissions@lincoln.edu.gh',
    feePerYear: 11200,
    applicationStatus: 'Interview booked',
    yearGroup: 'Year 7',
    distanceFromHome: '2.6 km',
    notes: 'Strong academics and transition support.',
  },
  {
    id: 'sch-2',
    childName: 'Adwoa Mensah',
    schoolName: 'Galaxy International School',
    address: 'Boundary Rd, East Cantonments',
    contactName: 'Mrs. Badu',
    contactDetails: '+233 20 456 8821',
    feePerYear: 8700,
    applicationStatus: 'Application sent',
    yearGroup: 'Year 4',
    distanceFromHome: '3.1 km',
    notes: 'Good arts and language support.',
  },
];

export const healthcareEntries = [
  {
    id: 'hc-1',
    personName: 'Kwame Mensah',
    doctorName: 'Dr. Esi Boateng',
    address: 'Nyaho Medical Centre, Airport Residential',
    fee: 140,
    contactDetails: '+233 30 708 6490',
    notes: 'General family physician.',
  },
  {
    id: 'hc-2',
    personName: 'Adwoa Mensah',
    doctorName: 'Dr. Kofi Addae',
    address: 'Ridge Hospital Pediatrics, Accra',
    fee: 110,
    contactDetails: '+233 20 657 0102',
    notes: 'Pediatric follow-up every 6 months.',
  },
];

export const budgetItems = [
  { id: 'b-1', category: 'Documents', itemName: 'Passport renewals', plannedCost: 520, actualCost: 510, currency: 'USD', status: 'completed', dueDate: '2026-04-20', notes: 'On budget' },
  { id: 'b-2', category: 'Visas', itemName: 'Visa processing fees', plannedCost: 1800, actualCost: 0, currency: 'USD', status: 'pending', dueDate: '2026-05-15', notes: 'Awaiting submission' },
  { id: 'b-3', category: 'Shipping', itemName: 'Door-to-door shipment', plannedCost: 7000, actualCost: 6800, currency: 'USD', status: 'in progress', dueDate: '2026-07-10', notes: 'Best-value quote selected' },
  { id: 'b-4', category: 'Schooling', itemName: 'First year tuition deposit', plannedCost: 6000, actualCost: 0, currency: 'USD', status: 'pending', dueDate: '2026-06-12', notes: 'Dependent on admissions' },
  { id: 'b-5', category: 'Housing', itemName: 'Security deposit', plannedCost: 4500, actualCost: 0, currency: 'USD', status: 'pending', dueDate: '2026-06-20', notes: 'Final property not chosen' },
];

export const miscNotes = [
  {
    id: 'n-1',
    title: 'Arrival day checklist',
    category: 'Travel',
    noteBody: 'Set up airport pickup, temporary SIM cards, and cash exchange plan.',
    priority: 'High',
    linkedPerson: 'Kwame Mensah',
    linkedSection: 'Moving Timeline',
    dateAdded: '2026-04-08',
  },
  {
    id: 'n-2',
    title: 'School records notarization',
    category: 'Schooling',
    noteBody: 'Request notarized transcripts before June 1.',
    priority: 'Medium',
    linkedPerson: 'Ama Mensah',
    linkedSection: 'Documents',
    dateAdded: '2026-04-10',
  },
];

export const dashboardActivity = [
  'Added a new shipping quote from Atlantic Relocation Co.',
  'Marked Nana\'s birth certificate as received.',
  'Updated budget estimate for visa processing.',
  'Added healthcare provider for Adwoa.',
];
