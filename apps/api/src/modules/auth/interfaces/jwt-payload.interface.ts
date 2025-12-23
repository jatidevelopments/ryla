export interface IJwtPayload {
  userId: string; // UUID from database
  email: string;
  role: string;
  deviceId: string;
}

