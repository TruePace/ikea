// Enhanced WakeServerService.js - More aggressive for Render cold starts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

class WakeServerService {
  constructor() {
    this.isWaking = false;
    this.lastWakeAttempt = 0;
    this.wakeInterval = 3 * 60 * 1000; // Reduced to 3 minutes
    this.coldStartDelay = 60000; // 60 seconds for cold start
  }

  // Check if server needs waking
  shouldWakeServer() {
    const now = Date.now();
    const timeSinceLastWake = now - this.lastWakeAttempt;
    return !this.isWaking && timeSinceLastWake > this.wakeInterval;
  }

  // ENHANCED: More aggressive wake sequence for Render
  async wakeServer(maxRetries = 4) {
    if (this.isWaking) {
      console.log('🔄 Server wake already in progress');
      return false;
    }

    this.isWaking = true;
    this.lastWakeAttempt = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔔 Waking server (attempt ${attempt}/${maxRetries})...`);
        
        // Step 1: Hit the wake endpoint first (if it exists)
        try {
          const wakeResponse = await fetch(`${API_BASE_URL}/wake`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(45000) // Longer timeout for cold starts
          });
          
          if (wakeResponse.ok) {
            console.log('✅ Wake endpoint responded');
          }
        } catch (wakeError) {
          console.log('⚠️ Wake endpoint not available, trying health...');
        }

        // Step 2: Check health endpoint
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(45000)
        });

        if (healthResponse.ok) {
          const health = await healthResponse.json();
          console.log('✅ Server health check passed:', health);
          
          // Step 3: For Render cold starts, give extra time then force news fetch
          if (health.uptime < 120) { // Server just started (less than 2 minutes uptime)
            console.log('🚀 Cold start detected, forcing news fetch after delay...');
            
            // Wait for server to fully initialize
            await new Promise(resolve => setTimeout(resolve, this.coldStartDelay));
            
            // Force immediate news fetch
            await this.forceFreshNews(null, true);
          }
          
          this.isWaking = false;
          return true;
        }

      } catch (error) {
        console.error(`❌ Wake attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Longer waits for Render
          const waitTime = Math.min(attempt * 5000, 20000); // Max 20 seconds
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    this.isWaking = false;
    console.error('❌ Failed to wake server after all attempts');
    return false;
  }

  // ENHANCED: More comprehensive server readiness check
  async ensureServerReady(ipInfo = null) {
    try {
      console.log('🔄 Ensuring server is ready...');
      
      // Step 1: Wake the server
      const isAwake = await this.wakeServer();
      
      if (!isAwake) {
        throw new Error('Failed to wake server');
      }

      // Step 2: Check keep-alive and trigger background fetch if needed
      const keepAliveResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000)
      });

      if (keepAliveResponse.ok) {
        const status = await keepAliveResponse.json();
        console.log('📊 Server status:', status);
        
        // Step 3: If server needs fresh news and isn't fetching, force it
        if (status.needsFreshNews && !status.isFetching) {
          console.log('📰 Server needs fresh news, forcing fetch...');
          setTimeout(() => {
            this.forceFreshNews(ipInfo, true);
          }, 2000);
        }
        
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error ensuring server ready:', error);
      return false;
    }
  }

  // ENHANCED: Force fresh news with better error handling
  async forceFreshNews(ipInfo = null, isUrgent = false) {
    try {
      const urgentLabel = isUrgent ? ' [URGENT]' : '';
      console.log(`🚀 Forcing server to fetch fresh news${urgentLabel}...`);
      
      const requestBody = {
        ip: ipInfo?.ip || 'auto',
        urgent: isUrgent,
        timestamp: Date.now()
      };
      
      const response = await fetch(`${API_BASE_URL}/api/health/force-fresh-news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(60000) // Longer timeout for news fetching
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Fresh news fetch result:', result);
        return result;
      }

      const errorText = await response.text();
      throw new Error(`Force fetch failed: ${response.status} ${errorText}`);

    } catch (error) {
      console.error('❌ Error forcing fresh news:', error);
      return null;
    }
  }

  // ENHANCED: More aggressive startup sequence
  async aggressiveStartup(ipInfo = null) {
    console.log('🚀 Starting aggressive server wake-up sequence...');
    
    try {
      // Step 1: Initial wake
      await this.wakeServer();
      
      // Step 2: Wait for server to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 3: Force fresh news immediately
      await this.forceFreshNews(ipInfo, true);
      
      // Step 4: Verify server is ready
      await this.ensureServerReady(ipInfo);
      
      console.log('✅ Aggressive startup completed');
      return true;
      
    } catch (error) {
      console.error('❌ Aggressive startup failed:', error);
      return false;
    }
  }

  // ENHANCED: Start periodic wake-up with better handling
  startPeriodicWakeUp() {
    console.log('🔄 Starting periodic wake-up service...');
    
    // Set up periodic wake (more frequent for Render)
    this.wakeIntervalId = setInterval(() => {
      if (this.shouldWakeServer()) {
        console.log('⏰ Periodic wake-up triggered');
        this.wakeServer();
      }
    }, this.wakeInterval);

    // ENHANCED: More aggressive visibility change handling
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden) {
        console.log('👀 Tab active - aggressive wake sequence...');
        await this.aggressiveStartup();
      }
    });

    // ENHANCED: Handle online events more aggressively
    window.addEventListener('online', async () => {
      console.log('🌐 Back online - aggressive wake sequence...');
      await this.aggressiveStartup();
    });

    // ENHANCED: Handle focus events
    window.addEventListener('focus', async () => {
      if (this.shouldWakeServer()) {
        console.log('🎯 Window focused - waking server...');
        await this.wakeServer();
      }
    });
  }

  // Stop periodic wake-up
  stopPeriodicWakeUp() {
    console.log('🛑 Stopping periodic wake-up service...');
    if (this.wakeIntervalId) {
      clearInterval(this.wakeIntervalId);
      this.wakeIntervalId = null;
    }
  }

  // ENHANCED: Get current server status
  async getServerStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/debug/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(15000)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting server status:', error);
      return null;
    }
  }
}

// Create singleton instance
const wakeServerService = new WakeServerService();

// Export service and helper functions
export default wakeServerService;

export const ensureServerAwake = (ipInfo) => wakeServerService.ensureServerReady(ipInfo);
export const forceFreshNews = (ipInfo, urgent) => wakeServerService.forceFreshNews(ipInfo, urgent);
export const startServerWakeUp = () => wakeServerService.startPeriodicWakeUp();
export const stopServerWakeUp = () => wakeServerService.stopPeriodicWakeUp();
export const aggressiveStartup = (ipInfo) => wakeServerService.aggressiveStartup(ipInfo);
export const getServerStatus = () => wakeServerService.getServerStatus();