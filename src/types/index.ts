export type UserRole = 'editor' | 'warehouse' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  dept?: string;
  active: boolean;
  password?: string;
  avatarInitials: string;
}

export type StockStatus = 'green' | 'yellow' | 'red';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category:
    | 'Common'
    | 'Assembly'
    | 'Painting'
    | 'Welding'
    | 'Press'
    | 'Conversion';
  unit: string;
  quantity: number;
  reorderPoint: number;
  unitCost: number;
  barcodeString: string;
  supplier: string;
  location: string;
  createdAt: number;
  imageUrl?: string;
}

export interface RequisitionItem {
  itemId: string;
  sku: string;
  itemName: string;
  qty: number;
  unitCost: number;
  imageUrl?: string;
}

export type RequisitionStatus = 'Pending' | 'Approved' | 'Fulfilled' | 'Rejected';

export interface Requisition {
  id: string;
  requestorName: string;
  requestorEmail?: string;
  purpose: string;
  deptCode: string;
  requiredDate: string;
  notes?: string;
  items: RequisitionItem[];
  status: RequisitionStatus;
  submittedAt: number;
  submittedBy?: string;
  processedBy?: string;
  processedAt?: number;
  rejectionReason?: string;
  shiftId?: ShiftId;
}

export type ShiftId = 'Shift A' | 'Shift B';

export interface IssuanceLog {
  id: string;
  timestamp: number;
  requisitionId?: string;
  itemId: string;
  itemName: string;
  sku: string;
  qtyIssued: number;
  unitCost: number;
  requestorName: string;
  issuingStaff: string;
  issuingStaffRole: UserRole;
  shiftId: ShiftId;
  purpose: string;
  updatedStockLevel: number;
}

export type EmailEventType =
  | 'RequisitionSubmitted'
  | 'RequisitionApproved'
  | 'RequisitionFulfilled'
  | 'RequisitionRejected'
  | 'IssuanceProcessed'
  | 'LowStockAlert'
  | 'StockAdjusted'
  | 'Welcome'
  | 'PasswordReset'
  | 'UserCreated'
  | 'System';

export interface EmailLog {
  id: string;
  timestamp: number;
  from: string;
  fromRole?: UserRole;
  to: string;
  toRole?: UserRole;
  subject: string;
  body: string;
  eventType: EmailEventType;
  read?: boolean;
  requisitionId?: string;
}

export interface CartItem {
  itemId: string;
  qty: number;
}

export type ThemeMode = 'light' | 'dark';

export type ActivePage =
  | 'dashboard'
  | 'inventory'
  | 'orders'
  | 'purchase'
  | 'reporting'
  | 'scanner'
  | 'requisitions'
  | 'support'
  | 'settings'
  | 'cart'
  | 'approval-form'
  | 'my-requisitions'
  | 'issuance-history';

export type SortField = 'name' | 'quantity' | 'sku' | 'unitCost' | 'category';
export type SortDir = 'asc' | 'desc';

export interface AppState {
  theme: ThemeMode;
  isAuthenticated: boolean;
  currentUser: User | null;
  activeShift: ShiftId;
  activePage: ActivePage;
  users: User[];
  inventory: InventoryItem[];
  requisitions: Requisition[];
  issuanceLogs: IssuanceLog[];
  emailLogs: EmailLog[];
  cart: CartItem[];
  lastHighlightedItemId: string | null;
  searchTerm: string;
}

export interface DashboardStats {
  totalProducts: number;
  orders: number;
  totalStock: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
  totalCustomers: number;
  pendingRequisitions: number;
  totalInventoryValue: number;
}

export interface WarehouseMetrics {
  uniqueSkus: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  pendingRequisitions: number;
}
