const config = require('./config');

// Initialize the Supabase client only once and make it available globally
(function() {
    if (!window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(
            'https://jgsbmnzhvuwiujqbaieo.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnc2JtbnpodnV3aXVqcWJhaWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MDAxNTEsImV4cCI6MjA1NjE3NjE1MX0.jGGW8mTgX7jXcWiylbxmjOwCIGdl226LRauVMXiWtc4',
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        );
        console.log("Supabase client initialized");
    }
})();

// Export a function to get the client
function getSupabaseClient() {
    return window.supabaseClient;
}
