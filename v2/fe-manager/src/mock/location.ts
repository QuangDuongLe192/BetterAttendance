import type { LocationEntity, WifiScan } from '../services/Location/location';

export const LOCATIONS: LocationEntity[] = [
  {
    locationId: 'L1', name: 'Bến Thành', address: '14 Lê Lợi, Bến Nghé, Quận 1',
    style: { color: '#00B4A0' }, status: 'Active',
    long: 106.6983, lat: 10.7724,
    validationConfig: { radiusMeters: 80, allowed_bssid: ['04:F0:21:A1:88:2C', '04:F0:21:A1:88:2D'] },
    activeValidation: ['geo', 'wifi'],
    autoIn: true, autoOut: true, staffCount: 18,
    delegation: { enabled: true, canAssignRoles: true, canEditAttendance: true, canApproveOT: true },
  },
  {
    locationId: 'L2', name: 'Thảo Điền', address: '52 Xuân Thuỷ, Thảo Điền, Quận 2',
    style: { color: '#2B7EC4' }, status: 'Active',
    long: 106.7376, lat: 10.8023,
    validationConfig: { radiusMeters: 60, allowed_bssid: ['04:F0:21:B2:14:91'] },
    activeValidation: ['geo', 'wifi'],
    autoIn: true, autoOut: false, staffCount: 12,
    delegation: { enabled: true, canAssignRoles: true, canEditAttendance: true, canApproveOT: false },
  },
  {
    locationId: 'L3', name: 'Phú Mỹ Hưng', address: 'SC04 Sky Garden, Nguyễn Văn Linh',
    style: { color: '#7C4FBF' }, status: 'Active',
    long: 106.7191, lat: 10.7297,
    validationConfig: { radiusMeters: 100, allowed_bssid: ['04:F0:21:C3:09:55'] },
    activeValidation: ['wifi'],
    autoIn: true, autoOut: true, staffCount: 14,
    delegation: { enabled: true, canAssignRoles: false, canEditAttendance: true, canApproveOT: false },
  },
  {
    locationId: 'L4', name: 'Hai Bà Trưng', address: '230 Hai Bà Trưng, Tân Định, Quận 3',
    style: { color: '#B45309' }, status: 'Active',
    long: 106.6912, lat: 10.7884,
    validationConfig: { radiusMeters: 50 },
    activeValidation: ['geo'],
    autoIn: false, autoOut: false, staffCount: 9,
    delegation: { enabled: false, canAssignRoles: false, canEditAttendance: false, canApproveOT: false },
  },
  {
    locationId: 'L5', name: 'Cầu Giấy (Hà Nội)', address: '167 Cầu Giấy, Phường Dịch Vọng',
    style: { color: '#EAB308' }, status: 'Active',
    long: 105.7889, lat: 21.0312,
    validationConfig: { radiusMeters: 70, allowed_bssid: ['04:F0:21:D4:77:0A'] },
    activeValidation: ['geo', 'wifi'],
    autoIn: true, autoOut: true, staffCount: 11,
    delegation: { enabled: true, canAssignRoles: false, canEditAttendance: false, canApproveOT: false },
  },
];

export const WIFI_SCAN: Record<string, WifiScan> = {
  L1: { scannedAt: 1747534440000, networks: [{ ssid: 'BetterCoffee-BenThanh', bssid: '04:F0:21:A1:88:2C', dbm: -42 }, { ssid: 'BetterCoffee-BenThanh-5G', bssid: '04:F0:21:A1:88:2D', dbm: -44 }, { ssid: 'POS-Terminal-01', bssid: '8C:85:90:11:42:01', dbm: -61 }, { ssid: 'Bình An Plaza', bssid: '74:DA:88:8F:22:11', dbm: -78 }] },
  L2: { scannedAt: 1747534440000, networks: [{ ssid: 'BetterCoffee-ThaoDien', bssid: '04:F0:21:B2:14:91', dbm: -38 }, { ssid: 'POS-L2-01', bssid: '8C:85:90:22:14:BB', dbm: -55 }, { ssid: 'Guest-ThaoDien', bssid: '74:DA:88:9A:33:CC', dbm: -72 }] },
  L3: { scannedAt: 1747534440000, networks: [{ ssid: 'BetterCoffee-PMH', bssid: '04:F0:21:C3:09:55', dbm: -45 }, { ssid: 'SC04-Mall-Guest', bssid: '74:DA:88:AA:00:11', dbm: -68 }] },
  L4: { scannedAt: 1747534440000, networks: [{ ssid: 'Neighbor-Store', bssid: '74:DA:88:BB:11:22', dbm: -70 }] },
  L5: { scannedAt: 1747534440000, networks: [{ ssid: 'BetterCoffee-CauGiay', bssid: '04:F0:21:D4:77:0A', dbm: -40 }, { ssid: 'POS-CauGiay-01', bssid: '8C:85:90:33:55:DD', dbm: -58 }, { ssid: 'Guest-CauGiay', bssid: '74:DA:88:CC:44:EE', dbm: -76 }] },
};

export const locById = (id: string): LocationEntity =>
  LOCATIONS.find(l => l.locationId === id)!;
