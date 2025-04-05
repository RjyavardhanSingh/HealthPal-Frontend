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
      console.log('Initializing Agora client');
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    
    // Clear any existing events first
    this.client.removeAllListeners();
    
    // Set up important events
    console.log('Setting up Agora client events');
    
    this.client.on('user-published', async (user, mediaType) => {
      console.log(`[AGORA] Remote user ${user.uid} published ${mediaType}`);
      
      // Subscribe to the user's stream
      await this.client.subscribe(user, mediaType);
      console.log(`[AGORA] Subscribed to ${mediaType} from user ${user.uid}`);
      
      // Handle the media based on its type
      if (mediaType === 'video') {
        // Play the video in the remote container
        setTimeout(() => {
          try {
            const remoteContainer = document.getElementById('remote-video-container');
            if (remoteContainer) {
              console.log(`[AGORA] Playing remote video in container`);
              user.videoTrack.play(remoteContainer);
            } else {
              console.error('[AGORA] Remote container not found');
            }
          } catch (err) {
            console.error('[AGORA] Error playing remote video:', err);
          }
        }, 500);
      } else if (mediaType === 'audio') {
        // For audio, just play it
        user.audioTrack.play();
        console.log('[AGORA] Remote audio playing');
      }
    });
    
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log(`[AGORA] User ${user.uid} unpublished ${mediaType}`);
    });
    
    this.client.on('user-left', (user) => {
      console.log(`[AGORA] User ${user.uid} left the channel`);
    });
    
    this.client.on('connection-state-change', (curState, prevState) => {
      console.log(`[AGORA] Connection state changed from ${prevState} to ${curState}`);
    });
    
    this.client.on('token-privilege-will-expire', async () => {
      console.log('[AGORA] Token privilege will expire soon');
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
      console.log(`[AGORA] Joining channel: ${channelName}`);
      if (!this.client) {
        await this.initialize();
      }
      
      // Join the channel
      await this.client.join(this.appId, channelName, token, uid);
      console.log(`[AGORA] Successfully joined channel: ${channelName}`);
      this.channelJoined = true;
      
      // Create local audio and video tracks
      console.log('[AGORA] Creating microphone and camera tracks');
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {
          encoderConfig: "music_standard"
        }, 
        {
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000
          }
        }
      );
      
      // Save references to tracks
      this.localTracks = {
        audioTrack,
        videoTrack
      };
      
      // Play the local video in the local container
      console.log('[AGORA] Playing local video');
      const localContainer = document.getElementById('local-video-container');
      if (localContainer) {
        videoTrack.play(localContainer);
      }
      
      // Publish the tracks to the channel
      console.log('[AGORA] Publishing local tracks to channel');
      await this.client.publish([audioTrack, videoTrack]);
      console.log('[AGORA] Successfully published local tracks');
      
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
      if (this.localTracks.videoTrack.isPlaying) {
        this.localTracks.videoTrack.stop();
        this.localTracks.videoTrack.close();
        this.localTracks.videoTrack.isPlaying = false;
      } else {
        this.localTracks.videoTrack.play('local-video-container');
        this.localTracks.videoTrack.isPlaying = true;
      }
    }
  }

  toggleMute() {
    if (this.localTracks && this.localTracks.audioTrack) {
      this.localTracks.audioTrack.setMuted(!this.localTracks.audioTrack.muted);
    }
  }
}

// Create a singleton instance
const agoraServiceInstance = new AgoraService();
export default agoraServiceInstance;