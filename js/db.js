/* Initialize Supabase Database */
const SUBAPASE_URL = "https://dpklrhucnvecvfczlaza.supabase.co";
const SUPABASE_KEY = "sb_publishable_RajSJIcGhkgFEAYMCBqXmQ_LYnY5WI5";

const _supabase = supabase.createClient(SUBAPASE_URL, SUPABASE_KEY);

// Dexie-like Wrapper for Supabase
const db = {
    // Helper to handle table operations
    _table: (tableName) => ({
        toArray: async () => {
            const { data, error } = await _supabase.from(tableName).select('*').order('id', { ascending: true });
            if (error) {
                console.error(`Error fetching ${tableName}:`, error);
                return [];
            }
            return data || [];
        },
        add: async (item) => {
            // Remove id if it's null/undefined to let Supabase generate it
            const { id, ...itemData } = item;
            const payload = id ? { id, ...itemData } : itemData;
            
            const { data, error } = await _supabase.from(tableName).insert([payload]).select();
            if (error) {
                console.error(`Error adding to ${tableName}:`, error);
                throw error;
            }
            return data[0].id;
        },
        bulkAdd: async (items) => {
            const { data, error } = await _supabase.from(tableName).insert(items).select();
            if (error) {
                console.error(`Error bulk adding to ${tableName}:`, error);
                throw error;
            }
            return data;
        },
        update: async (id, changes) => {
            const { error } = await _supabase.from(tableName).update(changes).eq('id', id);
            if (error) {
                console.error(`Error updating ${tableName}:`, error);
                throw error;
            }
            return 1;
        },
        delete: async (id) => {
            const { error } = await _supabase.from(tableName).delete().eq('id', id);
            if (error) {
                console.error(`Error deleting from ${tableName}:`, error);
                throw error;
            }
            return 1;
        },
        count: async () => {
            const { count, error } = await _supabase.from(tableName).select('*', { count: 'exact', head: true });
            if (error) {
                console.error(`Error counting ${tableName}:`, error);
                return 0;
            }
            return count || 0;
        },
        where: (field) => ({
            equals: (value) => ({
                first: async () => {
                    const { data, error } = await _supabase.from(tableName).select('*').eq(field, value).limit(1).maybeSingle();
                    if (error) {
                        console.error(`Error fetching first from ${tableName}:`, error);
                        return null;
                    }
                    return data;
                },
                toArray: async () => {
                    const { data, error } = await _supabase.from(tableName).select('*').eq(field, value);
                    if (error) {
                        console.error(`Error fetching where ${field} = ${value} from ${tableName}:`, error);
                        return [];
                    }
                    return data || [];
                },
                equals: (val2) => { /* Handle compound if needed, but app seems simple */ }
            }),
            equalsIgnoreCase: (value) => ({
                first: async () => {
                    const { data, error } = await _supabase.from(tableName).select('*').ilike(field, value).limit(1).maybeSingle();
                    if (error) {
                        console.error(`Error fetching case-insensitive first from ${tableName}:`, error);
                        return null;
                    }
                    return data;
                }
            }),
            below: (value) => ({
                count: async () => {
                    const { count, error } = await _supabase.from(tableName).select('*', { count: 'exact', head: true }).lt(field, value);
                    if (error) return 0;
                    return count || 0;
                }
            })
        }),
        get: async (id) => {
            const { data, error } = await _supabase.from(tableName).select('*').eq('id', id).maybeSingle();
            if (error) {
                console.error(`Error getting id ${id} from ${tableName}:`, error);
                return null;
            }
            return data;
        }
    }),

    on: (event, callback) => {
        if (event === 'populate') {
            // Check if users exist to trigger seed
            db.users.count().then(count => {
                if (count === 0) callback();
            });
        }
    }
};

// Define tables
const tables = ['products', 'sales', 'vendors', 'users', 'customers', 'expenses', 'returns', 'coupons', 'holds'];
tables.forEach(t => {
    db[t] = db._table(t);
});

console.log("Supabase Database Wrapper (v2) Initialized");
