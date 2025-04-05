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
  }

  async initialize() {
    if (!this.client) {
      console.log('Initializing Agora client');
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      // Make sure events are properly attached
      this.setupClientEvents();
    }
    return this.client;
  }

  setupClientEvents() {
    if (this.eventsInitialized) return;
    
    this.client.on('user-published', async (user, mediaType) => {
      console.log(`Remote user ${user.uid} published ${mediaType}`);
      
      await this.client.subscribe(user, mediaType);
      console.log(`Subscribed to ${mediaType} from user ${user.uid}`);
      
      if (mediaType === 'video') {
        console.log(`Processing remote video for user ${user.uid}`);
        
        // More robust element targeting
        setTimeout(() => {
          try {
            // Try multiple container elements in sequence
            const containers = [
              document.getElementById(`remote-video-${user.uid}`),
              document.getElementById('remote-video-container'),
              document.getElementById('remote-video-0')
            ];
            
            let played = false;
            for (const container of containers) {
              if (container) {
                console.log(`Playing video in container: ${container.id}`);
                user.videoTrack.play(container);
                played = true;
                break;
              }
            }
            
            if (!played) {
              console.error('No suitable container found for remote video');
              // Last resort - play in any video container
              const anyContainer = document.querySelector('.aspect-video');
              if (anyContainer) {
                console.log('Playing in fallback container');
                user.videoTrack.play(anyContainer);
              }
            }
          } catch (playError) {
            console.error(`Error playing remote video for user ${user.uid}:`, playError);
          }
        }, 1000);
      }
      
      if (mediaType === 'audio') {
        try {
          user.audioTrack.play();
          console.log(`Playing remote audio for user ${user.uid}`);
        } catch (audioError) {
          console.error(`Error playing remote audio for user ${user.uid}:`, audioError);
        }
      }
    });
    
    this.eventsInitialized = true;
  }

  isConnected() {
    return this.client && (
      this.client.connectionState === 'CONNECTED' || 
      this.client.connectionState === 'CONNECTING'
    );
  }

  async joinChannel(channelName, token, uid = null, onUserJoined, onUserLeft) {
    try {
      if (!this.client) {
        await this.initialize();
      }
      
      // Set up event handlers for remote users
      this.client.on('user-published', async (user, mediaType) => {
        console.log(`User ${user.uid} published ${mediaType} track`);
        
        // Subscribe to the remote user
        await this.client.subscribe(user, mediaType);
        console.log(`Subscribed to ${mediaType} track of user ${user.uid}`);
        
        // Call the callback to handle the user joining
        if (onUserJoined && typeof onUserJoined === 'function') {
          onUserJoined(user);
        }
      });
      
      this.client.on('user-unpublished', (user, mediaType) => {
        console.log(`User ${user.uid} unpublished ${mediaType} track`);
      });
      
      this.client.on('user-left', (user) => {
        console.log(`User ${user.uid} left the channel`);
        if (onUserLeft && typeof onUserLeft === 'function') {
          onUserLeft(user);
        }
      });
      
      // Join the channel
      const userId = uid || 0; // Use 0 for dynamic assignment
      await this.client.join(this.appId, channelName, token, userId);
      console.log('Successfully joined channel:', channelName);
      
      // Create and publish tracks
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      this.localTracks = { audioTrack: microphoneTrack, videoTrack: cameraTrack };
      
      await this.client.publish(Object.values(this.localTracks));
      console.log('Published local tracks');
      
      return {
        uid: this.client.uid,
        audioTrack: microphoneTrack,
        videoTrack: cameraTrack
      };
    } catch (error) {
      console.error('Error joining channel:', error);
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
      
      return true;
    } catch (error) {
      console.error('Error leaving channel:', error);
      return false;
    }
  }

  toggleMute() {
    if (this.localAudioTrack) {
      const muted = !this.localAudioTrack.muted;
      this.localAudioTrack.setMuted(muted);
      return muted;
    }
    return false;
  }

  toggleVideo() {
    if (this.localVideoTrack) {
      const disabled = !this.localVideoTrack.muted;
      this.localVideoTrack.setMuted(disabled);
      return disabled;
    }
    return false;
  }
}

// Create a singleton instance
const agoraServiceInstance = new AgoraService();
export default agoraServiceInstance;