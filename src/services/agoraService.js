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
    }
    return this.client;
  }
  
  isConnected() {
    return this.client && (
      this.client.connectionState === 'CONNECTED' || 
      this.client.connectionState === 'CONNECTING'
    );
  }

  async joinChannel(channelName, token, uid = null, onUserPublished = null, onUserLeft = null) {
    try {
      if (this.isJoining) {
        console.log('Join already in progress, ignoring redundant request');
        return null;
      }
      
      this.isJoining = true;
      console.log(`Attempting to join channel: ${channelName} with token: ${token ? 'Present' : 'Missing'}`);
      
      if (this.isConnected()) {
        console.log('Already connected to a channel, leaving first...');
        await this.leaveChannel();
      }
      
      await this.initialize();
      
      if (!this.eventsInitialized) {
        this.client.on('user-published', async (user, mediaType) => {
          console.log(`Remote user ${user.uid} published ${mediaType}`);
          await this.client.subscribe(user, mediaType);
          
          if (mediaType === 'video') {
            console.log(`Playing remote user ${user.uid} video`);
            // Fix: Use element ID instead of element reference
            user.videoTrack.play(`remote-video-${user.uid}`, {fit: 'cover'});
            if (onUserPublished) onUserPublished(user);
          }
          
          if (mediaType === 'audio') {
            console.log(`Playing remote user ${user.uid} audio`);
            user.audioTrack.play();
          }
        });
        
        this.client.on('user-left', (user) => {
          console.log('Remote user left:', user.uid);
          if (onUserLeft) onUserLeft(user);
        });
        
        this.eventsInitialized = true;
      }
      
      const joinedUid = uid || Math.floor(Math.random() * 100000);
      console.log(`Joining channel "${channelName}" with UID: ${joinedUid}`);
      
      try {
        // First try with token
        if (token) {
          console.log('Joining with token');
          await this.client.join(
            this.appId,
            channelName,
            token,
            joinedUid
          );
        } else {
          // Fallback to join without token (dev mode only)
          console.log('Joining without token (development mode)');
          await this.client.join(
            this.appId,
            channelName,
            null,
            joinedUid
          );
        }
        
        console.log('Client joined channel successfully');
        
        // Create and publish local tracks
        console.log('Creating local audio and video tracks');
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { encoderConfig: 'standard' },
          { encoderConfig: { width: 640, height: 480, frameRate: 30 } }
        );
        
        this.localAudioTrack = microphoneTrack;
        this.localVideoTrack = cameraTrack;
        
        console.log('Publishing local tracks to channel');
        await this.client.publish([microphoneTrack, cameraTrack]);
        console.log('Local tracks published successfully');
        
        this.isJoining = false;
        return {
          uid: joinedUid,
          audioTrack: microphoneTrack,
          videoTrack: cameraTrack
        };
      } catch (joinError) {
        console.error('Error during join:', joinError);
        throw joinError;
      }
    } catch (error) {
      this.isJoining = false;
      console.error('Error joining Agora channel:', error);
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