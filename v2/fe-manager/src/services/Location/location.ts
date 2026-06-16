export interface ValidationConfig {
  radiusMeters: number;
  allowed_bssid?: string[];
  required_accuracy?: number;
}

export type ValidationMode = 'geo' | 'wifi' | 'face';

export interface LocationDelegation {
  enabled: boolean;
  canAssignRoles: boolean;
  canEditAttendance: boolean;
  canApproveOT: boolean;
}

export interface LocationEntity {
  locationId: string;
  name: string;
  address: string;
  long: number;
  lat: number;
  validationConfig: ValidationConfig;
  activeValidation: ValidationMode[];
  style: { color: string };
  status: 'Active' | 'Inactive';
  delegation: LocationDelegation;
  staffCount: number;
  autoIn: boolean;
  autoOut: boolean;
}

export interface WifiScanResult {
  ssid: string;
  bssid: string;
  dbm?: number;
}

export interface WifiScan {
  scannedAt: number;  // UTC ms
  networks: WifiScanResult[];
}
