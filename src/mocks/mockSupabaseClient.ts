/**
 * Mock Supabase Client for Demo Mode
 * Replaces real Supabase with localStorage-based storage
 */

import {
  MEAL_CATEGORIES,
  DEMO_CLIENT,
  DEMO_STRUCTURED_PLAN,
  DEMO_FLEXIBLE_PLAN,
  DEMO_STRUCTURED_MEALS,
  DEMO_FLEXIBLE_OPTIONS,
  DEMO_USER_ROLES,
  DEMO_AI_PROMPTS,
  DEMO_APP_SETTINGS
} from './data/seedData';

// Storage keys
const STORAGE_PREFIX = 'meal_planner_';
const STORAGE_KEYS = {
  INITIALIZED: `${STORAGE_PREFIX}initialized`,
  CLIENTS: `${STORAGE_PREFIX}clients`,
  MEAL_PLANS: `${STORAGE_PREFIX}meal_plans`,
  MEAL_CATEGORIES: `${STORAGE_PREFIX}meal_categories`,
  FLEXIBLE_OPTIONS: `${STORAGE_PREFIX}flexible_options`,
  STRUCTURED_MEALS: `${STORAGE_PREFIX}structured_meals`,
  PLAN_INSTRUCTIONS: `${STORAGE_PREFIX}plan_instructions`,
  USER_ROLES: `${STORAGE_PREFIX}user_roles`,
  CLIENT_HISTORY: `${STORAGE_PREFIX}client_history`,
  AI_PROMPTS: `${STORAGE_PREFIX}ai_prompts`,
  APP_SETTINGS: `${STORAGE_PREFIX}app_settings`,
  SESSION: `${STORAGE_PREFIX}session`
};

// Initialize storage with seed data
function initializeStorage() {
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([DEMO_CLIENT]));
  localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify([DEMO_STRUCTURED_PLAN, DEMO_FLEXIBLE_PLAN]));
  localStorage.setItem(STORAGE_KEYS.MEAL_CATEGORIES, JSON.stringify(MEAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.FLEXIBLE_OPTIONS, JSON.stringify(DEMO_FLEXIBLE_OPTIONS));
  localStorage.setItem(STORAGE_KEYS.STRUCTURED_MEALS, JSON.stringify(DEMO_STRUCTURED_MEALS));
  localStorage.setItem(STORAGE_KEYS.PLAN_INSTRUCTIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.USER_ROLES, JSON.stringify(DEMO_USER_ROLES));
  localStorage.setItem(STORAGE_KEYS.CLIENT_HISTORY, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.AI_PROMPTS, JSON.stringify(DEMO_AI_PROMPTS));
  localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(DEMO_APP_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

  console.log('[MockSupabase] Initialized with demo data');
}

// Get table data from localStorage
function getTable(tableName: string): any[] {
  const key = `${STORAGE_PREFIX}${tableName}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Set table data to localStorage
function setTable(tableName: string, data: any[]) {
  const key = `${STORAGE_PREFIX}${tableName}`;
  localStorage.setItem(key, JSON.stringify(data));
}

// Map table names to storage keys
const TABLE_MAP: Record<string, string> = {
  clients: 'clients',
  meal_plans: 'meal_plans',
  meal_categories: 'meal_categories',
  flexible_plan_options: 'flexible_options',
  structured_plan_meals: 'structured_meals',
  plan_instructions: 'plan_instructions',
  user_roles: 'user_roles',
  client_history_notes: 'client_history',
  ai_prompt_templates: 'ai_prompts',
  app_settings: 'app_settings'
};

// Query builder class
class MockQueryBuilder {
  private tableName: string;
  private data: any[];
  private filters: Array<{ column: string; operator: string; value: any }> = [];
  private selectedColumns: string | null = null;
  private orderColumn: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private singleResult: boolean = false;
  private maybeSingleResult: boolean = false;
  private countOnly: boolean = false;
  private headOnly: boolean = false;

  constructor(tableName: string) {
    this.tableName = TABLE_MAP[tableName] || tableName;
    this.data = getTable(this.tableName);
  }

  select(columns: string = '*', options?: { count?: string; head?: boolean }) {
    this.selectedColumns = columns;
    if (options?.count === 'exact') {
      this.countOnly = true;
    }
    if (options?.head) {
      this.headOnly = true;
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this.execute();
  }

  maybeSingle() {
    this.maybeSingleResult = true;
    return this.execute();
  }

  async insert(records: any | any[]) {
    const recordsArray = Array.isArray(records) ? records : [records];
    const newRecords = recordsArray.map(record => ({
      ...record,
      id: record.id || `${this.tableName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: record.created_at || new Date().toISOString()
    }));

    this.data = [...this.data, ...newRecords];
    setTable(this.tableName, this.data);

    return { data: newRecords, error: null };
  }

  async update(updates: any) {
    let updatedRecords: any[] = [];

    this.data = this.data.map(record => {
      if (this.matchesFilters(record)) {
        const updated = { ...record, ...updates, updated_at: new Date().toISOString() };
        updatedRecords.push(updated);
        return updated;
      }
      return record;
    });

    setTable(this.tableName, this.data);
    return { data: updatedRecords, error: null };
  }

  async delete() {
    const deletedRecords = this.data.filter(record => this.matchesFilters(record));
    this.data = this.data.filter(record => !this.matchesFilters(record));
    setTable(this.tableName, this.data);
    return { data: deletedRecords, error: null };
  }

  private matchesFilters(record: any): boolean {
    return this.filters.every(filter => {
      const value = record[filter.column];
      switch (filter.operator) {
        case 'eq':
          return value === filter.value;
        case 'ilike':
          const pattern = filter.value.replace(/%/g, '.*');
          return new RegExp(pattern, 'i').test(value);
        default:
          return true;
      }
    });
  }

  private applyFilters(): any[] {
    return this.data.filter(record => this.matchesFilters(record));
  }

  private applyOrder(data: any[]): any[] {
    if (!this.orderColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[this.orderColumn!];
      const bVal = b[this.orderColumn!];

      if (aVal < bVal) return this.orderAscending ? -1 : 1;
      if (aVal > bVal) return this.orderAscending ? 1 : -1;
      return 0;
    });
  }

  private selectColumns(record: any): any {
    if (!this.selectedColumns || this.selectedColumns === '*') {
      return record;
    }

    // Handle nested relations (e.g., meal_categories:category_id(name))
    const columns = this.selectedColumns.split(',').map(c => c.trim());
    const result: any = {};

    for (const col of columns) {
      // Check for relation syntax: table:foreign_key(fields)
      const relationMatch = col.match(/(\w+):(\w+)\(([^)]+)\)/);
      if (relationMatch) {
        const [, relationTable, foreignKey, fields] = relationMatch;
        const relatedData = getTable(TABLE_MAP[relationTable] || relationTable);
        const relatedRecord = relatedData.find((r: any) => r.id === record[foreignKey]);

        if (relatedRecord) {
          const fieldList = fields.split(',').map(f => f.trim());
          result[relationTable] = {};
          for (const field of fieldList) {
            result[relationTable][field] = relatedRecord[field];
          }
        } else {
          result[relationTable] = null;
        }
      } else {
        result[col] = record[col];
      }
    }

    return result;
  }

  private execute(): Promise<{ data: any; error: any; count?: number }> {
    return new Promise(resolve => {
      // Small delay to simulate network
      setTimeout(() => {
        try {
          let result = this.applyFilters();
          result = this.applyOrder(result);

          if (this.limitCount) {
            result = result.slice(0, this.limitCount);
          }

          result = result.map(r => this.selectColumns(r));

          if (this.countOnly && this.headOnly) {
            resolve({ data: null, error: null, count: result.length });
            return;
          }

          if (this.singleResult) {
            if (result.length === 0) {
              resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
            } else {
              resolve({ data: result[0], error: null });
            }
            return;
          }

          if (this.maybeSingleResult) {
            resolve({ data: result.length > 0 ? result[0] : null, error: null });
            return;
          }

          resolve({ data: result, error: null });
        } catch (error) {
          resolve({ data: null, error });
        }
      }, 50);
    });
  }

  then(resolve: (value: any) => void) {
    this.execute().then(resolve);
  }
}

// Mock Auth Client
class MockAuthClient {
  private session: any = null;
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedSession) {
      this.session = JSON.parse(savedSession);
    }
  }

  async getSession() {
    return { data: { session: this.session }, error: null };
  }

  async signInWithOtp({ email }: { email: string; options?: any }) {
    // In demo mode, auto-sign in
    const user = {
      id: 'demo-user-001',
      email: email,
      user_metadata: { display_name: email.split('@')[0] },
      created_at: new Date().toISOString()
    };

    this.session = {
      access_token: 'demo-token-' + Date.now(),
      refresh_token: 'demo-refresh-' + Date.now(),
      expires_at: Date.now() + 86400000,
      user
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(this.session));

    // Notify listeners
    this.listeners.forEach(cb => cb('SIGNED_IN', this.session));

    console.log('[MockAuth] Signed in as:', email);
    return { data: {}, error: null };
  }

  async signOut() {
    this.session = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.listeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);

    // Immediately call with current state
    if (this.session) {
      setTimeout(() => callback('SIGNED_IN', this.session), 0);
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
          }
        }
      }
    };
  }
}

// Mock Functions Client
class MockFunctionsClient {
  async invoke(functionName: string, options: { body: any }) {
    if (functionName === 'generate-meal-plan') {
      return this.mockGenerateMealPlan(options.body);
    }
    return { data: null, error: new Error('Unknown function: ' + functionName) };
  }

  private async mockGenerateMealPlan(request: any) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock AI response based on plan type
    if (request.planType === 'flexible') {
      return {
        data: {
          success: true,
          mealPlan: {
            flexible: [
              { categoryName: 'Πρωινό', options: ['Βρώμη overnight με γάλα αμυγδάλου και μπανάνα', '2 αυγά με φέτα και ψωμί ολικής', 'Γιαούρτι με γκρανόλα και μέλι', 'Αβοκάντο τοστ με αυγά ποσέ'] },
              { categoryName: 'Δεκατιανό/Snack', options: ['1 μήλο + 20γρ αμύγδαλα', 'Γιαούρτι με μέλι', '1 μπανάνα + φυστικοβούτυρο', 'Trail mix 40γρ'] },
              { categoryName: 'Μεσημεριανό', options: ['Κοτόπουλο ψητό 150γρ + πατάτες φούρνου', 'Σολομός 150γρ + ρύζι + μπρόκολο', 'Φακές σούπα + ψωμί + φέτα', 'Γαλοπούλα 150γρ + κινόα + σαλάτα'] },
              { categoryName: 'Απογευματινό', options: ['Χούμους + καρότα', 'Cottage cheese + αχλάδι', 'Ρυζογκοφρέτες + αμυγδαλοβούτυρο', 'Μαύρη σοκολάτα + καρύδια'] },
              { categoryName: 'Βραδινό', options: ['Τσιπούρα ψητή + λαχανικά', 'Μπριζόλα + γλυκοπατάτα', 'Γαρίδες + ζυμαρικά ολικής', 'Φασολάδα + ψωμί + φέτα'] }
            ]
          },
          reasoning: 'Demo AI response for flexible plan'
        },
        error: null
      };
    } else {
      return {
        data: {
          success: true,
          mealPlan: {
            structured: [
              { day: 1, meals: { 'Πρωινό': '2 αυγά με φέτα + ψωμί ολικής', 'Δεκατιανό/Snack': '1 μήλο + αμύγδαλα', 'Μεσημεριανό': 'Κοτόπουλο ψητό + ρύζι + σαλάτα', 'Απογευματινό': 'Γιαούρτι με μέλι', 'Βραδινό': 'Σολομός + λαχανικά' } },
              { day: 2, meals: { 'Πρωινό': 'Βρώμη με μπανάνα', 'Δεκατιανό/Snack': 'Ξηροί καρποί', 'Μεσημεριανό': 'Φακές σούπα + ψωμί', 'Απογευματινό': 'Φρούτο', 'Βραδινό': 'Τσιπούρα + σαλάτα' } },
              { day: 3, meals: { 'Πρωινό': 'Γιαούρτι με γκρανόλα', 'Δεκατιανό/Snack': 'Μπανάνα', 'Μεσημεριανό': 'Γαλοπούλα + κινόα', 'Απογευματινό': 'Χούμους + καρότα', 'Βραδινό': 'Μοσχάρι + πατάτες' } },
              { day: 4, meals: { 'Πρωινό': 'Αβοκάντο τοστ + αυγά', 'Δεκατιανό/Snack': 'Αχλάδι', 'Μεσημεριανό': 'Ρεβύθια + ψωμί', 'Απογευματινό': 'Cottage cheese', 'Βραδινό': 'Γαρίδες + ζυμαρικά' } },
              { day: 5, meals: { 'Πρωινό': 'Ομελέτα με λαχανικά', 'Δεκατιανό/Snack': 'Smoothie', 'Μεσημεριανό': 'Μουσακάς', 'Απογευματινό': 'Καρύδια + σοκολάτα', 'Βραδινό': 'Μπακαλιάρος + πουρές' } },
              { day: 6, meals: { 'Πρωινό': 'Pancakes με μέλι', 'Δεκατιανό/Snack': 'Trail mix', 'Μεσημεριανό': 'Μπριζόλα + σαλάτα', 'Απογευματινό': 'Γιαούρτι', 'Βραδινό': 'Γεμιστά' } },
              { day: 7, meals: { 'Πρωινό': 'Αυγά με μανιτάρια', 'Δεκατιανό/Snack': 'Φρουτοσαλάτα', 'Μεσημεριανό': 'Κοτόπουλο + κριθαράκι', 'Απογευματινό': 'Αμύγδαλα', 'Βραδινό': 'Φασολάδα + ψωμί' } }
            ]
          },
          reasoning: 'Demo AI response for structured plan'
        },
        error: null
      };
    }
  }
}

// Mock Realtime Channel
class MockRealtimeChannel {
  private channelName: string;

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  on(event: string, options: any, callback: Function) {
    // No-op in demo mode
    return this;
  }

  subscribe() {
    console.log(`[MockRealtime] Subscribed to channel: ${this.channelName}`);
    return this;
  }
}

// Create mock Supabase client
function createMockSupabaseClient() {
  // Initialize storage on first use
  initializeStorage();

  return {
    from: (table: string) => new MockQueryBuilder(table),
    auth: new MockAuthClient(),
    functions: new MockFunctionsClient(),
    channel: (name: string) => new MockRealtimeChannel(name),
    removeChannel: () => {}
  };
}

export const supabase = createMockSupabaseClient();
export default supabase;
