import { Area, BusStop, RoadEdge, DepartureSlot, Bus, Driver, User, Booking, StudentRecord, CollegeRoute } from '../types';

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'stu-1045',
    studentId: 'stu-1045',
    registrationNumber: '23CSE1045',
    name: 'Apoorva Sundar',
    email: 'apoorva.23cse@college.edu',
    department: 'Computer Science & Engineering',
    year: 2,
    section: 'A',
    isHosteller: false,
    phone: '+91 98401 11223',
    active: true,
    // bcrypt hash of 'password'
    passwordHash: '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1',
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'stu-1046',
    studentId: 'stu-1046',
    registrationNumber: '23CSE1046',
    name: 'Bhuvaneshwari R',
    email: 'bhuvi.23cse@college.edu',
    department: 'Computer Science & Engineering',
    year: 2,
    section: 'A',
    isHosteller: true,
    hostelName: 'Kaveri Girls Hostel',
    phone: '+91 98401 22334',
    active: true,
    passwordHash: '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1',
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'stu-1047',
    studentId: 'stu-1047',
    registrationNumber: '23CSE1047',
    name: 'Chandrashekar V',
    email: 'chandra.23cse@college.edu',
    department: 'Information Technology',
    year: 3,
    section: 'B',
    isHosteller: false,
    phone: '+91 98401 33445',
    active: true,
    passwordHash: '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1',
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'usr-student-1',
    studentId: 'usr-student-1',
    registrationNumber: '21CS104',
    name: 'Arun Kumar',
    email: 'arun.k@college.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    isHosteller: false,
    phone: '+91 98765 43210',
    active: true,
    passwordHash: '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1',
    createdAt: '2024-08-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'usr-student-2',
    studentId: 'usr-student-2',
    registrationNumber: '22EC205',
    name: 'Priya Sundar',
    email: 'priya.s@college.edu',
    department: 'Electronics & Communication',
    year: 2,
    section: 'B',
    isHosteller: false,
    phone: '+91 98765 43211',
    active: true,
    passwordHash: '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1',
    createdAt: '2024-08-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'stu-inactive-99',
    studentId: 'stu-inactive-99',
    registrationNumber: '23ME1099',
    name: 'Dinesh Karthik',
    email: 'dinesh.inactive@college.edu',
    department: 'Mechanical Engineering',
    year: 4,
    section: 'A',
    isHosteller: false,
    phone: '+91 98401 99887',
    active: false,
    passwordHash: '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1',
    createdAt: '2024-08-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'stu-hostel-01',
    studentId: 'stu-hostel-01',
    registrationNumber: '23HS2001',
    name: 'Gowtham Raj',
    email: 'gowtham.hostel@college.edu',
    department: 'Electrical & Electronics',
    year: 1,
    section: 'C',
    isHosteller: true,
    hostelName: 'Ganga Boys Hostel Room 304',
    phone: '+91 98401 55667',
    active: true,
    passwordHash: '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1',
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  }
];

export const INITIAL_ROUTES: CollegeRoute[] = [
  {
    id: 'route-adyar-express',
    routeCode: 'R-ADY-01',
    name: 'Route 1: Guindy - Saidapet - Adyar Signal Express',
    direction: 'OUTBOUND',
    corridor: 'Guindy-Saidapet-Adyar',
    stopIds: ['stop-college', 'stop-guindy-kathipara', 'stop-saidapet-metro', 'stop-adyar-signal', 'stop-adyar-depot', 'stop-lb-road'],
    estimatedDistanceKm: 26.8,
    estimatedDurationMin: 52,
    maxAllowedDurationMin: 65,
    active: true,
    assignedBusId: 'bus-1',
    assignedDriverId: 'drv-1',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-15T08:00:00Z'
  },
  {
    id: 'route-velachery-adyar',
    routeCode: 'R-VLC-02',
    name: 'Route 2: Velachery - Kasturba Nagar - Indira Nagar',
    direction: 'OUTBOUND',
    corridor: 'Velachery-Kasturba-Adyar',
    stopIds: ['stop-college', 'stop-velachery-bypass', 'stop-velachery-mrts', 'stop-kasturba-nagar', 'stop-indira-nagar', 'stop-adyar-signal'],
    estimatedDistanceKm: 25.0,
    estimatedDurationMin: 47,
    maxAllowedDurationMin: 60,
    active: true,
    assignedBusId: 'bus-2',
    assignedDriverId: 'drv-2',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-15T08:00:00Z'
  },
  {
    id: 'route-omr-thiruvanmiyur',
    routeCode: 'R-OMR-03',
    name: 'Route 3: OMR Tech Corridor - Thiruvanmiyur - Besant Nagar',
    direction: 'OUTBOUND',
    corridor: 'OMR-Thiruvanmiyur-Adyar',
    stopIds: ['stop-college', 'stop-perungudi', 'stop-srp-tools', 'stop-tidel-park', 'stop-thiruvanmiyur-depot', 'stop-besant-nagar'],
    estimatedDistanceKm: 27.5,
    estimatedDurationMin: 55,
    maxAllowedDurationMin: 65,
    active: true,
    assignedBusId: 'bus-3',
    assignedDriverId: 'drv-3',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-15T08:00:00Z'
  }
];


export const INITIAL_AREAS: Area[] = [
  {
    id: 'area-adyar',
    name: 'Adyar',
    description: 'Major South Chennai hub with residential, educational & coastal access points',
    primaryCorridors: ['Guindy-Saidapet-Adyar', 'Velachery-Kasturba-Adyar', 'OMR-Thiruvanmiyur-Adyar']
  },
  {
    id: 'area-velachery',
    name: 'Velachery',
    description: 'High-density residential and MRTS corridor connecting South & Central Chennai',
    primaryCorridors: ['Tambaram-Velachery-Bypass', 'Guindy-Velachery']
  },
  {
    id: 'area-guindy',
    name: 'Guindy & Saidapet',
    description: 'Central transit gateway, Kathipara junction and Metro hub',
    primaryCorridors: ['College-Kathipara-Guindy', 'Saidapet-Anna-Salai']
  },
  {
    id: 'area-thiruvanmiyur',
    name: 'Thiruvanmiyur & Besant Nagar',
    description: 'Coastal and cultural zone, gateway to ECR and OMR',
    primaryCorridors: ['OMR-Tidel-Thiruvanmiyur', 'Besant-Nagar-Loop']
  },
  {
    id: 'area-omr',
    name: 'OMR IT Corridor',
    description: 'Rajiv Gandhi Salai tech corridor with high evening student/intern traffic',
    primaryCorridors: ['OMR-Tidel-Sholinganallur']
  },
  {
    id: 'area-tambaram',
    name: 'Tambaram & Chromepet',
    description: 'Southwestern gateway connecting GST road and suburban rail',
    primaryCorridors: ['GST-Tambaram-Chromepet']
  }
];

export const INITIAL_STOPS: BusStop[] = [
  // College Origin Hub
  {
    id: 'stop-college',
    name: 'College Main Campus (Origin)',
    areaId: 'area-tambaram',
    corridor: 'Origin Hub',
    latitude: 12.8715,
    longitude: 80.0820,
    estimatedDistFromCollegeKm: 0,
    estimatedTimeFromCollegeMin: 0,
    isMajorJunction: true
  },
  // Guindy / Saidapet Corridor
  {
    id: 'stop-guindy-kathipara',
    name: 'Guindy Kathipara Junction',
    areaId: 'area-guindy',
    corridor: 'Guindy-Saidapet-Adyar',
    latitude: 13.0067,
    longitude: 80.2025,
    estimatedDistFromCollegeKm: 18.5,
    estimatedTimeFromCollegeMin: 32,
    isMajorJunction: true
  },
  {
    id: 'stop-saidapet-metro',
    name: 'Saidapet Metro / Anna Salai',
    areaId: 'area-guindy',
    corridor: 'Guindy-Saidapet-Adyar',
    latitude: 13.0210,
    longitude: 80.2230,
    estimatedDistFromCollegeKm: 21.0,
    estimatedTimeFromCollegeMin: 38,
    isMajorJunction: true
  },
  // Adyar Stops
  {
    id: 'stop-adyar-signal',
    name: 'Adyar Signal (Lattice Bridge)',
    areaId: 'area-adyar',
    corridor: 'Guindy-Saidapet-Adyar',
    latitude: 13.0062,
    longitude: 80.2575,
    estimatedDistFromCollegeKm: 25.2,
    estimatedTimeFromCollegeMin: 48,
    isMajorJunction: true
  },
  {
    id: 'stop-adyar-depot',
    name: 'Adyar Bus Depot',
    areaId: 'area-adyar',
    corridor: 'Guindy-Saidapet-Adyar',
    latitude: 13.0012,
    longitude: 80.2520,
    estimatedDistFromCollegeKm: 26.0,
    estimatedTimeFromCollegeMin: 50,
    isMajorJunction: false
  },
  {
    id: 'stop-lb-road',
    name: 'LB Road (Lal Bahadur Shastri)',
    areaId: 'area-adyar',
    corridor: 'Guindy-Saidapet-Adyar',
    latitude: 12.9975,
    longitude: 80.2560,
    estimatedDistFromCollegeKm: 26.8,
    estimatedTimeFromCollegeMin: 52,
    isMajorJunction: false
  },
  {
    id: 'stop-kasturba-nagar',
    name: 'Kasturba Nagar 3rd Cross',
    areaId: 'area-adyar',
    corridor: 'Velachery-Kasturba-Adyar',
    latitude: 13.0020,
    longitude: 80.2480,
    estimatedDistFromCollegeKm: 24.5,
    estimatedTimeFromCollegeMin: 46,
    isMajorJunction: false
  },
  {
    id: 'stop-indira-nagar',
    name: 'Indira Nagar Water Tank',
    areaId: 'area-adyar',
    corridor: 'Velachery-Kasturba-Adyar',
    latitude: 12.9930,
    longitude: 80.2505,
    estimatedDistFromCollegeKm: 25.0,
    estimatedTimeFromCollegeMin: 47,
    isMajorJunction: false
  },
  {
    id: 'stop-besant-nagar',
    name: 'Besant Nagar Bus Terminus',
    areaId: 'area-thiruvanmiyur',
    corridor: 'OMR-Thiruvanmiyur-Adyar',
    latitude: 13.0005,
    longitude: 80.2670,
    estimatedDistFromCollegeKm: 27.5,
    estimatedTimeFromCollegeMin: 55,
    isMajorJunction: false
  },
  {
    id: 'stop-thiruvanmiyur-depot',
    name: 'Thiruvanmiyur Bus Stand / Signal',
    areaId: 'area-thiruvanmiyur',
    corridor: 'OMR-Thiruvanmiyur-Adyar',
    latitude: 12.9860,
    longitude: 80.2600,
    estimatedDistFromCollegeKm: 24.8,
    estimatedTimeFromCollegeMin: 45,
    isMajorJunction: true
  },
  // Velachery Stops
  {
    id: 'stop-velachery-bypass',
    name: 'Velachery Bypass Road',
    areaId: 'area-velachery',
    corridor: 'Velachery-Kasturba-Adyar',
    latitude: 12.9780,
    longitude: 80.2185,
    estimatedDistFromCollegeKm: 21.5,
    estimatedTimeFromCollegeMin: 40,
    isMajorJunction: true
  },
  {
    id: 'stop-velachery-mrts',
    name: 'Velachery MRTS Station',
    areaId: 'area-velachery',
    corridor: 'Velachery-Kasturba-Adyar',
    latitude: 12.9800,
    longitude: 80.2220,
    estimatedDistFromCollegeKm: 22.0,
    estimatedTimeFromCollegeMin: 42,
    isMajorJunction: true
  },
  // OMR Stops
  {
    id: 'stop-tidel-park',
    name: 'Tidel Park Junction (OMR)',
    areaId: 'area-omr',
    corridor: 'OMR-Thiruvanmiyur-Adyar',
    latitude: 12.9890,
    longitude: 80.2470,
    estimatedDistFromCollegeKm: 23.5,
    estimatedTimeFromCollegeMin: 43,
    isMajorJunction: true
  },
  {
    id: 'stop-srp-tools',
    name: 'SRP Tools (OMR)',
    areaId: 'area-omr',
    corridor: 'OMR-Thiruvanmiyur-Adyar',
    latitude: 12.9750,
    longitude: 80.2450,
    estimatedDistFromCollegeKm: 22.8,
    estimatedTimeFromCollegeMin: 41,
    isMajorJunction: false
  },
  {
    id: 'stop-perungudi',
    name: 'Perungudi Toll Plaza',
    areaId: 'area-omr',
    corridor: 'OMR-Thiruvanmiyur-Adyar',
    latitude: 12.9600,
    longitude: 80.2420,
    estimatedDistFromCollegeKm: 21.0,
    estimatedTimeFromCollegeMin: 38,
    isMajorJunction: false
  }
];

export const INITIAL_ROAD_EDGES: RoadEdge[] = [
  // From College Origin
  { id: 'e1', fromStopId: 'stop-college', toStopId: 'stop-guindy-kathipara', distanceKm: 18.5, travelTimeMin: 32, trafficMultiplier: 1.15, corridorName: 'GST Expressway' },
  { id: 'e2', fromStopId: 'stop-college', toStopId: 'stop-velachery-bypass', distanceKm: 21.5, travelTimeMin: 40, trafficMultiplier: 1.2, corridorName: 'Medavakkam-Velachery Road' },
  { id: 'e3', fromStopId: 'stop-college', toStopId: 'stop-perungudi', distanceKm: 21.0, travelTimeMin: 38, trafficMultiplier: 1.1, corridorName: '200 Feet Radial Road' },
  
  // Guindy Corridor
  { id: 'e4', fromStopId: 'stop-guindy-kathipara', toStopId: 'stop-saidapet-metro', distanceKm: 3.5, travelTimeMin: 8, trafficMultiplier: 1.25, corridorName: 'Anna Salai' },
  { id: 'e5', fromStopId: 'stop-saidapet-metro', toStopId: 'stop-adyar-signal', distanceKm: 4.8, travelTimeMin: 12, trafficMultiplier: 1.3, corridorName: 'Sardar Patel Road' },
  { id: 'e6', fromStopId: 'stop-adyar-signal', toStopId: 'stop-adyar-depot', distanceKm: 1.2, travelTimeMin: 4, trafficMultiplier: 1.1, corridorName: 'Lattice Bridge Road' },
  { id: 'e7', fromStopId: 'stop-adyar-signal', toStopId: 'stop-lb-road', distanceKm: 1.6, travelTimeMin: 5, trafficMultiplier: 1.15, corridorName: 'LB Road' },
  { id: 'e8', fromStopId: 'stop-lb-road', toStopId: 'stop-besant-nagar', distanceKm: 1.8, travelTimeMin: 6, trafficMultiplier: 1.1, corridorName: 'Besant Avenue' },

  // Velachery & Kasturba Corridor
  { id: 'e9', fromStopId: 'stop-velachery-bypass', toStopId: 'stop-velachery-mrts', distanceKm: 1.2, travelTimeMin: 3, trafficMultiplier: 1.1, corridorName: 'Bypass Ext.' },
  { id: 'e10', fromStopId: 'stop-velachery-mrts', toStopId: 'stop-kasturba-nagar', distanceKm: 3.5, travelTimeMin: 9, trafficMultiplier: 1.2, corridorName: 'Gandhi Mandapam Link' },
  { id: 'e11', fromStopId: 'stop-kasturba-nagar', toStopId: 'stop-indira-nagar', distanceKm: 1.1, travelTimeMin: 3, trafficMultiplier: 1.05, corridorName: 'Kasturba Cross' },
  { id: 'e12', fromStopId: 'stop-indira-nagar', toStopId: 'stop-adyar-signal', distanceKm: 1.5, travelTimeMin: 4, trafficMultiplier: 1.1, corridorName: 'Adyar Link' },

  // OMR & Thiruvanmiyur Corridor
  { id: 'e13', fromStopId: 'stop-perungudi', toStopId: 'stop-srp-tools', distanceKm: 2.2, travelTimeMin: 5, trafficMultiplier: 1.15, corridorName: 'Rajiv Gandhi Salai' },
  { id: 'e14', fromStopId: 'stop-srp-tools', toStopId: 'stop-tidel-park', distanceKm: 1.8, travelTimeMin: 4, trafficMultiplier: 1.2, corridorName: 'OMR Expressway' },
  { id: 'e15', fromStopId: 'stop-tidel-park', toStopId: 'stop-thiruvanmiyur-depot', distanceKm: 1.6, travelTimeMin: 4, trafficMultiplier: 1.2, corridorName: 'Thiruvanmiyur Bypass' },
  { id: 'e16', fromStopId: 'stop-thiruvanmiyur-depot', toStopId: 'stop-besant-nagar', distanceKm: 2.0, travelTimeMin: 6, trafficMultiplier: 1.1, corridorName: 'MG Road Link' },
  { id: 'e17', fromStopId: 'stop-thiruvanmiyur-depot', toStopId: 'stop-lb-road', distanceKm: 1.9, travelTimeMin: 5, trafficMultiplier: 1.15, corridorName: 'LB Road South' }
];

export const INITIAL_DEPARTURE_SLOTS: DepartureSlot[] = [
  {
    id: 'slot-3pm',
    name: '3:00 PM Afternoon Regular',
    departureTime: '15:00',
    displayTime: '3:00 PM',
    active: true,
    bookingOpenTime: '06:00',
    bookingCloseTime: '14:00',
    minDemandThreshold: 15,
    description: 'Primary afternoon departure slot for students with regular class schedules.'
  },
  {
    id: 'slot-5pm',
    name: '5:00 PM Evening Special & Labs',
    departureTime: '17:00',
    displayTime: '5:00 PM',
    active: true,
    bookingOpenTime: '06:00',
    bookingCloseTime: '16:00',
    minDemandThreshold: 15,
    description: 'Late departure slot for practical laboratory sessions, sports teams & project hours.'
  }
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-1',
    registrationNumber: 'TN-09-CB-1001',
    capacity: 50,
    type: 'STANDARD_50',
    status: 'AVAILABLE',
    fuelLevelPct: 92,
    lastMaintenanceDate: '2026-08-01',
    fitnessCertificateValidUntil: '2027-08-01'
  },
  {
    id: 'bus-2',
    registrationNumber: 'TN-09-CB-1002',
    capacity: 50,
    type: 'STANDARD_50',
    status: 'AVAILABLE',
    fuelLevelPct: 88,
    lastMaintenanceDate: '2026-07-28',
    fitnessCertificateValidUntil: '2027-07-28'
  },
  {
    id: 'bus-3',
    registrationNumber: 'TN-09-CB-1003',
    capacity: 50,
    type: 'STANDARD_50',
    status: 'AVAILABLE',
    fuelLevelPct: 95,
    lastMaintenanceDate: '2026-08-05',
    fitnessCertificateValidUntil: '2027-09-15'
  },
  {
    id: 'bus-4',
    registrationNumber: 'TN-09-CB-1004',
    capacity: 50,
    type: 'STANDARD_50',
    status: 'AVAILABLE',
    fuelLevelPct: 79,
    lastMaintenanceDate: '2026-08-02',
    fitnessCertificateValidUntil: '2027-06-30'
  },
  {
    id: 'bus-5',
    registrationNumber: 'TN-09-CB-1005',
    capacity: 32,
    type: 'MINI_32',
    status: 'AVAILABLE',
    fuelLevelPct: 84,
    lastMaintenanceDate: '2026-08-10',
    fitnessCertificateValidUntil: '2027-05-12'
  },
  {
    id: 'bus-6',
    registrationNumber: 'TN-09-CB-1006',
    capacity: 60,
    type: 'HEAVY_60',
    status: 'AVAILABLE',
    fuelLevelPct: 90,
    lastMaintenanceDate: '2026-07-20',
    fitnessCertificateValidUntil: '2027-07-20'
  },
  {
    id: 'bus-7',
    registrationNumber: 'TN-09-CB-1007',
    capacity: 50,
    type: 'STANDARD_50',
    status: 'MAINTENANCE',
    fuelLevelPct: 40,
    lastMaintenanceDate: '2026-08-12',
    fitnessCertificateValidUntil: '2026-08-30'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    employeeId: 'DRV-101',
    name: 'Murugan Sundaram',
    phone: '+91 98401 23456',
    licenseNumber: 'TN-09-2015-0045892',
    licenseExpiry: '2028-11-20',
    isAvailable: true,
    status: 'ACTIVE',
    rating: 4.9
  },
  {
    id: 'drv-2',
    employeeId: 'DRV-102',
    name: 'Rajendran Paul',
    phone: '+91 98402 34567',
    licenseNumber: 'TN-09-2017-0098234',
    licenseExpiry: '2029-04-15',
    isAvailable: true,
    status: 'ACTIVE',
    rating: 4.8
  },
  {
    id: 'drv-3',
    employeeId: 'DRV-103',
    name: 'Karthik Venkatesh',
    phone: '+91 98403 45678',
    licenseNumber: 'TN-09-2018-0012903',
    licenseExpiry: '2029-08-30',
    isAvailable: true,
    status: 'ACTIVE',
    rating: 4.95
  },
  {
    id: 'drv-4',
    employeeId: 'DRV-104',
    name: 'Selvam Anthony',
    phone: '+91 98404 56789',
    licenseNumber: 'TN-09-2016-0078129',
    licenseExpiry: '2027-10-10',
    isAvailable: true,
    status: 'ACTIVE',
    rating: 4.7
  },
  {
    id: 'drv-5',
    employeeId: 'DRV-105',
    name: 'Gopalakrishnan Natarajan',
    phone: '+91 98405 67890',
    licenseNumber: 'TN-09-2014-0034112',
    licenseExpiry: '2028-02-28',
    isAvailable: true,
    status: 'ACTIVE',
    rating: 4.85
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-student-1',
    username: 'stu_arun',
    email: 'arun.k@college.edu',
    name: 'Arun Kumar',
    role: 'STUDENT',
    phone: '+91 98765 43210',
    studentProfile: {
      studentId: 'stu-001',
      registrationNumber: '21CS104',
      department: 'Computer Science & Engineering',
      year: 3,
      areaId: 'area-adyar',
      preferredStopId: 'stop-adyar-signal',
      exactDestination: 'Lattice Bridge Road, Adyar',
      isHosteller: false,
      busPassNumber: 'BP-2026-CS104'
    }
  },
  {
    id: 'usr-student-2',
    username: 'stu_priya',
    email: 'priya.s@college.edu',
    name: 'Priya Sundar',
    role: 'STUDENT',
    phone: '+91 98765 43211',
    studentProfile: {
      studentId: 'stu-002',
      registrationNumber: '22EC205',
      department: 'Electronics & Communication',
      year: 2,
      areaId: 'area-adyar',
      preferredStopId: 'stop-lb-road',
      exactDestination: 'LB Road Bus Stop',
      isHosteller: false,
      busPassNumber: 'BP-2026-EC205'
    }
  },
  {
    id: 'usr-driver-1',
    username: 'drv_murugan',
    email: 'murugan.driver@college.edu',
    name: 'Murugan Sundaram',
    role: 'DRIVER',
    phone: '+91 98401 23456',
    driverProfile: {
      driverId: 'drv-1',
      employeeId: 'DRV-101',
      licenseNumber: 'TN-09-2015-0045892',
      licenseExpiry: '2028-11-20',
      phone: '+91 98401 23456',
      isAvailable: true,
      assignedBusId: 'bus-1',
      experienceYears: 12
    }
  },
  {
    id: 'usr-admin-1',
    username: 'admin_transport',
    email: 'transport.officer@college.edu',
    name: 'Dr. S. Ramanathan',
    role: 'ADMIN',
    phone: '+91 98400 11223'
  }
];

// Helper to generate the exact benchmark demand described in Section 10 of the prompt:
// Adyar Signal = 24, LB Road = 16, Kasturba Nagar = 8, Thiruvanmiyur = 22, Besant Nagar = 14 (Total = 84)
export function generateAdyarBenchmarkBookings(date: string, slotId: string = 'slot-3pm'): Booking[] {
  const bookings: Booking[] = [];
  let idCounter = 1;

  const distribution = [
    { stopId: 'stop-adyar-signal', stopName: 'Adyar Signal', areaId: 'area-adyar', count: 24, prefix: 'ADS' },
    { stopId: 'stop-lb-road', stopName: 'LB Road', areaId: 'area-adyar', count: 16, prefix: 'LBR' },
    { stopId: 'stop-kasturba-nagar', stopName: 'Kasturba Nagar', areaId: 'area-adyar', count: 8, prefix: 'KSN' },
    { stopId: 'stop-thiruvanmiyur-depot', stopName: 'Thiruvanmiyur Bus Stand', areaId: 'area-thiruvanmiyur', count: 22, prefix: 'TVM' },
    { stopId: 'stop-besant-nagar', stopName: 'Besant Nagar', areaId: 'area-thiruvanmiyur', count: 14, prefix: 'BSN' },
    // Guindy & Saidapet en-route demands
    { stopId: 'stop-guindy-kathipara', stopName: 'Guindy Kathipara', areaId: 'area-guindy', count: 9, prefix: 'GND' },
    { stopId: 'stop-saidapet-metro', stopName: 'Saidapet Metro', areaId: 'area-guindy', count: 7, prefix: 'SDP' },
    // Velachery demand
    { stopId: 'stop-velachery-bypass', stopName: 'Velachery Bypass', areaId: 'area-velachery', count: 12, prefix: 'VLC' }
  ];

  for (const item of distribution) {
    for (let i = 1; i <= item.count; i++) {
      const bId = `bk-${slotId}-${item.prefix}-${i.toString().padStart(3, '0')}`;
      bookings.push({
        id: bId,
        bookingNumber: `BKG-2026-${(1000 + idCounter).toString()}`,
        studentId: `stu-gen-${idCounter}`,
        studentRegNo: `23${item.prefix}${i.toString().padStart(3, '0')}`,
        studentName: `Student ${item.prefix}-${i}`,
        studentDepartment: i % 2 === 0 ? 'CSE' : i % 3 === 0 ? 'ECE' : 'MECH',
        date,
        slotId,
        areaId: item.areaId,
        stopId: item.stopId,
        stopName: item.stopName,
        status: 'CONFIRMED',
        bookedAt: new Date(Date.now() - (idCounter * 120000)).toISOString(),
        boardingPassCode: `PASS-${item.prefix}-${(2000 + idCounter)}`,
        seatNumber: i
      });
      idCounter++;
    }
  }

  return bookings;
}
