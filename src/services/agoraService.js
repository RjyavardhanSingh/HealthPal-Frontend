import AgoraRTC from "agora-rtc-sdk-ng";

class AgoraService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = {};
    // Fallback to a hardcoded value if environment variable is unavailable
    this.appId = import.meta.env.VITE_AGORA_APP_ID || '1d367e44c9bc45ff8903ebc0e679ccec';
    this.isJoining = false;
    this.eventsInitialized = false;
    this.channelJoined = false;
  }

  async initialize() {
    if (!this.client) {
      console.log('[AGORA] Initializing client');
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    
    // Clear any existing event listeners
    this.client.removeAllListeners();
    
    // Set up event handlers for remote user
    this.client.on('user-published', async (user, mediaType) => {
      console.log(`[AGORA] User ${user.uid} published ${mediaType}`);
      
      try {
        // Subscribe to the user's stream
        await this.client.subscribe(user, mediaType);
        console.log(`[AGORA] Subscribed to ${mediaType} from user ${user.uid}`);
        
        if (mediaType === 'video') {
          // Play remote video in the remote container
          setTimeout(() => {
            const remoteContainer = document.getElementById('remote-video-container');
            if (remoteContainer) {
              console.log('[AGORA] Playing remote video');
              user.videoTrack.play(remoteContainer);
            }
          }, 500);
        }
        
        if (mediaType === 'audio') {
          console.log('[AGORA] Playing remote audio');
          user.audioTrack.play();
        }
      } catch (error) {
        console.error(`[AGORA] Error handling ${mediaType}:`, error);
      }
    });
    
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log(`[AGORA] User ${user.uid} unpublished ${mediaType}`);
    });
    
    return this.client;
  }

  resetClient() {
    if (this.client) {
      // Remove all existing event listeners
      this.client.removeAllListeners();
      
      // Leave channel if already in one
      if (this.channelJoined) {
        return this.leaveChannel();
      }
    }
    return Promise.resolve();
  }

  isConnected() {
    return this.client && (
      this.client.connectionState === 'CONNECTED' || 
      this.client.connectionState === 'CONNECTING'
    );
  }

  async joinChannel(channelName, token, uid = 0) {
    try {
      if (!this.client) {
        await this.initialize();
      }
      
      // Join the channel
      console.log(`[AGORA] Joining channel ${channelName}`);
      await this.client.join(this.appId, channelName, token, uid);
      console.log(`[AGORA] Joined channel as uid ${this.client.uid}`);
      this.channelJoined = true;
      
      // Create local tracks
      console.log('[AGORA] Creating microphone and camera tracks');
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      this.localTracks = {
        audioTrack,
        videoTrack
      };
      
      // Play the local video
      const localContainer = document.getElementById('local-video-container');
      if (localContainer) {
        console.log('[AGORA] Playing local video in container');
        videoTrack.play(localContainer);
      }
      
      // Publish tracks to the channel
      console.log('[AGORA] Publishing tracks to channel');
      await this.client.publish([audioTrack, videoTrack]);
      console.log('[AGORA] Tracks published successfully');
      
      return this.localTracks;
    } catch (error) {
      console.error('[AGORA] Error joining channel:', error);
      throw error;
    }
  }

  async leaveChannel() {
    try {
      console.log('Leaving Agora channel...');
      
      if (this.localAudioTrack || this.localVideoTrack) {
        try {
          await this.client?.unpublish([this.localAudioTrack, this.localVideoTrack]);
        } catch (unpublishError) {
          console.warn('Error unpublishing tracks:', unpublishError);
        }
      }
      
      this.localAudioTrack?.close();
      this.localVideoTrack?.close();
      
      if (this.client && this.isConnected()) {
        await this.client.leave();
        console.log('Left channel successfully');
      }
      
      this.remoteUsers = {};
      this.localAudioTrack = null;
      this.localVideoTrack = null;
      this.channelJoined = false;
      
      return true;
    } catch (error) {
      console.error('Error leaving channel:', error);
      return false;
    }
  }

  toggleVideo() {
    if (this.localTracks && this.localTracks.videoTrack) {
      const videoTrack = this.localTracks.videoTrack;
      const newState = !videoTrack.enabled;
      videoTrack.setEnabled(newState);
      console.log('[AGORA] Video track enabled:', newState);
      return newState; // Return the new state
    }
    return false;
  }

  toggleAudio() {
    if (this.localTracks && this.localTracks.audioTrack) {
      const audioTrack = this.localTracks.audioTrack;
      const newState = !audioTrack.enabled;
      audioTrack.setEnabled(newState);
      console.log('[AGORA] Audio track enabled:', newState);
      return newState; // Return the new state
    }
    return false;
  }
}

// Create a singleton instance
const agoraServiceInstance = new AgoraService();
export default agoraServiceInstance;