// WakeServerService.js - Client-side service to wake up the server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

class WakeServerService {
  constructor() {
    this.isWaking = false;
    this.lastWakeAttempt = 0;
    this.wakeInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Check if server needs waking
  shouldWakeServer() {
    const now = Date.now();
    const timeSinceLastWake = now - this.lastWakeAttempt;
    return !this.isWaking && timeSinceLastWake > this.wakeInterval;
  }

  // Wake up the server with retries
  async wakeServer(maxRetries = 3) {
    if (this.isWaking) {
      console.log('🔄 Server wake already in progress');
      return false;
    }

    this.isWaking = true;
    this.lastWakeAttempt = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔔 Waking server (attempt ${attempt}/${maxRetries})...`);
        
        // First, try the health endpoint
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (healthResponse.ok) {
          const health = await healthResponse.json();
          console.log('✅ Server is awake:', health);
          
          // If server needs fresh news, it will fetch automatically
          if (health.newsState?.needsFresh) {
            console.log('📰 Server is fetching fresh news...');
          }
          
          this.isWaking = false;
          return true;
        }

      } catch (error) {
        console.error(`❌ Wake attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait longer between retries (exponential backoff)
          const waitTime = attempt * 2000;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    this.isWaking = false;
    console.error('❌ Failed to wake server after all attempts');
    return false;
  }

  // Ensure server is awake and has fresh news
  async ensureServerReady() {
    try {
      // Try to wake the server
      const isAwake = await this.wakeServer();
      
      if (!isAwake) {
        throw new Error('Failed to wake server');
      }

      // Give server a moment to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check keep-alive status
      const keepAliveResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000)
      });

      if (keepAliveResponse.ok) {
        const status = await keepAliveResponse.json();
        console.log('📊 Server status:', status);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error ensuring server ready:', error);
      return false;
    }
  }

  // Force server to fetch fresh news
  async forceFreshNews(ipInfo = null) {
    try {
      console.log('🚀 Forcing server to fetch fresh news...');
      
      const response = await fetch(`${API_BASE_URL}/api/health/force-fresh-news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ipInfo?.ip || 'auto' }),
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Fresh news fetch result:', result);
        return result;
      }

      throw new Error(`Force fetch failed: ${response.statusText}`);

    } catch (error) {
      console.error('❌ Error forcing fresh news:', error);
      return null;
    }
  }

  // Start periodic wake-up when app is active
  startPeriodicWakeUp() {
    // Initial wake on start
    this.wakeServer();

    // Set up periodic wake
    this.wakeIntervalId = setInterval(() => {
      if (this.shouldWakeServer()) {
        this.wakeServer();
      }
    }, this.wakeInterval);

    // Wake when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.shouldWakeServer()) {
        console.log('👀 Tab active - waking server...');
        this.wakeServer();
      }
    });

    // Wake on online event
    window.addEventListener('online', () => {
      console.log('🌐 Back online - waking server...');
      this.wakeServer();
    });
  }

  // Stop periodic wake-up
  stopPeriodicWakeUp() {
    if (this.wakeIntervalId) {
      clearInterval(this.wakeIntervalId);
      this.wakeIntervalId = null;
    }
  }
}

// Create singleton instance
const wakeServerService = new WakeServerService();

// Export service and helper functions
export default wakeServerService;

export const ensureServerAwake = () => wakeServerService.ensureServerReady();
export const forceFreshNews = (ipInfo) => wakeServerService.forceFreshNews(ipInfo);
export const startServerWakeUp = () => wakeServerService.startPeriodicWakeUp();
export const stopServerWakeUp = () => wakeServerService.stopPeriodicWakeUp();