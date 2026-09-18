import { supabase, isSupabaseConfigured } from './supabase';
import type { InventoryItem, User, Requisition, IssuanceLog, EmailLog } from '@/types';

/**
 * Service to sync application state with Supabase tables
 */
export const SupabaseService = {
  /**
   * Fetch all inventory items from Supabase
   */
  async fetchInventory(): Promise<InventoryItem[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('inventory_items').select('*').order('name');
    if (error) {
      console.error('Supabase fetchInventory error:', error);
      return null;
    }
    return (data || []).map(row => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      category: row.category,
      unit: row.unit,
      quantity: Number(row.quantity),
      reorderPoint: Number(row.reorder_point),
      unitCost: Number(row.unit_cost),
      barcodeString: row.barcode_string,
      supplier: row.supplier,
      location: row.location,
      createdAt: Number(row.created_at),
      imageUrl: row.image_url || undefined,
    }));
  },

  /**
   * Upsert an inventory item
   */
  async upsertItem(item: InventoryItem) {
    if (!supabase) return;
    const { error } = await supabase.from('inventory_items').upsert({
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      reorder_point: item.reorderPoint,
      unit_cost: item.unitCost,
      barcode_string: item.barcodeString,
      supplier: item.supplier,
      location: item.location,
      created_at: item.createdAt,
      image_url: item.imageUrl || null,
    });
    if (error) console.error('Supabase upsertItem error:', error);
  },

  /**
   * Delete an inventory item
   */
  async deleteItem(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) console.error('Supabase deleteItem error:', error);
  },

  /**
   * Fetch all users
   */
  async fetchUsers(): Promise<User[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Supabase fetchUsers error:', error);
      return null;
    }
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department || row.dept,
      dept: row.dept || row.department,
      active: row.active,
      password: row.password,
      avatarInitials: row.avatar_initials || 'U',
    }));
  },

  /**
   * Upsert user profile
   */
  async upsertUser(user: User) {
    if (!supabase) return;
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || user.dept,
      dept: user.dept || user.department,
      active: user.active,
      password: user.password,
      avatar_initials: user.avatarInitials,
    });
    if (error) console.error('Supabase upsertUser error:', error);
  },

  /**
   * Fetch requisitions
   */
  async fetchRequisitions(): Promise<Requisition[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('requisitions').select('*').order('submitted_at', { ascending: false });
    if (error) {
      console.error('Supabase fetchRequisitions error:', error);
      return null;
    }
    return (data || []).map(row => ({
      id: row.id,
      requestorName: row.requestor_name,
      requestorEmail: row.requestor_email,
      purpose: row.purpose,
      deptCode: row.dept_code,
      requiredDate: row.required_date,
      notes: row.notes,
      items: row.items || [],
      status: row.status,
      submittedAt: Number(row.submitted_at),
      submittedBy: row.submitted_by,
      processedBy: row.processed_by,
      processedAt: row.processed_at ? Number(row.processed_at) : undefined,
      rejectionReason: row.rejection_reason,
      shiftId: row.shift_id,
    }));
  },

  /**
   * Upsert requisition
   */
  async upsertRequisition(req: Requisition) {
    if (!supabase) return;
    const { error } = await supabase.from('requisitions').upsert({
      id: req.id,
      requestor_name: req.requestorName,
      requestor_email: req.requestorEmail,
      purpose: req.purpose,
      dept_code: req.deptCode,
      required_date: req.requiredDate,
      notes: req.notes,
      items: req.items,
      status: req.status,
      submitted_at: req.submittedAt,
      submitted_by: req.submittedBy,
      processed_by: req.processedBy,
      processed_at: req.processedAt,
      rejection_reason: req.rejectionReason,
      shift_id: req.shiftId,
    });
    if (error) console.error('Supabase upsertRequisition error:', error);
  },

  /**
   * Fetch Issuance Logs
   */
  async fetchIssuanceLogs(): Promise<IssuanceLog[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('issuance_logs').select('*').order('timestamp', { ascending: false });
    if (error) {
      console.error('Supabase fetchIssuanceLogs error:', error);
      return null;
    }
    return (data || []).map(row => ({
      id: row.id,
      timestamp: Number(row.timestamp),
      requisitionId: row.requisition_id,
      itemId: row.item_id,
      itemName: row.item_name,
      sku: row.sku,
      qtyIssued: Number(row.qty_issued),
      unitCost: Number(row.unit_cost),
      requestorName: row.requestor_name,
      issuingStaff: row.issuing_staff,
      issuingStaffRole: row.issuing_staff_role,
      shiftId: row.shift_id,
      purpose: row.purpose,
      updatedStockLevel: Number(row.updated_stock_level),
    }));
  },

  /**
   * Add Issuance Log
   */
  async addIssuanceLog(log: IssuanceLog) {
    if (!supabase) return;
    const { error } = await supabase.from('issuance_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      requisition_id: log.requisitionId,
      item_id: log.itemId,
      item_name: log.itemName,
      sku: log.sku,
      qty_issued: log.qtyIssued,
      unit_cost: log.unitCost,
      requestor_name: log.requestorName,
      issuing_staff: log.issuingStaff,
      issuing_staff_role: log.issuingStaffRole,
      shift_id: log.shiftId,
      purpose: log.purpose,
      updated_stock_level: log.updatedStockLevel,
    });
    if (error) console.error('Supabase addIssuanceLog error:', error);
  },

  /**
   * Fetch Email Logs
   */
  async fetchEmailLogs(): Promise<EmailLog[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('email_logs').select('*').order('timestamp', { ascending: false });
    if (error) {
      console.error('Supabase fetchEmailLogs error:', error);
      return null;
    }
    return (data || []).map(row => ({
      id: row.id,
      timestamp: Number(row.timestamp),
      from: row.from_user,
      fromRole: row.from_role,
      to: row.to_user,
      toRole: row.to_role,
      subject: row.subject,
      body: row.body,
      eventType: row.event_type,
      read: Boolean(row.read),
      requisitionId: row.requisition_id,
    }));
  },

  /**
   * Add Email Log
   */
  async addEmailLog(log: EmailLog) {
    if (!supabase) return;
    const { error } = await supabase.from('email_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      from_user: log.from,
      from_role: log.fromRole,
      to_user: log.to,
      to_role: log.toRole,
      subject: log.subject,
      body: log.body,
      event_type: log.eventType,
      read: log.read || false,
      requisition_id: log.requisitionId,
    });
    if (error) console.error('Supabase addEmailLog error:', error);
  },

  /**
   * Bulk seed initial data to Supabase if database is empty
   */
  async seedInitialIfEmpty(seedData: {
    users: User[];
    inventory: InventoryItem[];
    requisitions: Requisition[];
    issuanceLogs: IssuanceLog[];
    emailLogs: EmailLog[];
  }) {
    if (!supabase) return;
    try {
      const { count } = await supabase.from('inventory_items').select('*', { count: 'exact', head: true });
      if (count === 0) {
        console.log('Seeding Supabase database with initial catalog...');

        // Seed users
        for (const u of seedData.users) {
          await this.upsertUser(u);
        }
        // Seed inventory
        for (const item of seedData.inventory) {
          await this.upsertItem(item);
        }
        // Seed requisitions
        for (const req of seedData.requisitions) {
          await this.upsertRequisition(req);
        }
        // Seed issuance logs
        for (const log of seedData.issuanceLogs) {
          await this.addIssuanceLog(log);
        }
        // Seed email logs
        for (const email of seedData.emailLogs) {
          await this.addEmailLog(email);
        }
        console.log('Supabase initial seed completed.');
      }
    } catch (err) {
      console.warn('Initial seed error:', err);
    }
  }
};
