import AgoraRTC from 'agora-rtc-sdk-ng';

class AgoraService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = {};
    this.appId = import.meta.env.VITE_AGORA_APP_ID || '1d367e44c9bc45ff8903ebc0e679ccec';
    this.isJoining = false;
  }

  async initialize() {
    if (!this.client) {
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return this.client;
  }
  
  // New method to check connection state
  isConnected() {
    return this.client && (
      this.client.connectionState === 'CONNECTED' || 
      this.client.connectionState === 'CONNECTING'
    );
  }

  async joinChannel(channelName, token, uid = null, onUserPublished = null, onUserLeft = null) {
    try {
      // Prevent multiple join attempts
      if (this.isJoining) {
        console.log('Join already in progress, ignoring redundant request');
        return null;
      }
      
      this.isJoining = true;
      
      // Force leave any existing channel first
      if (this.isConnected()) {
        console.log('Already connected to a channel, leaving first...');
        await this.leaveChannel();
      }
      
      // Initialize the AgoraRTC client
      await this.initialize();
      
      // Set event handlers if not already set
      if (!this.eventsInitialized) {
        this.client.on('user-published', async (user, mediaType) => {
          // Handle remote user publishing stream
          await this.client.subscribe(user, mediaType);
          console.log('Subscribed to remote user:', user.uid);
          
          if (mediaType === 'video' && onUserPublished) {
            onUserPublished(user);
          }
          
          if (mediaType === 'audio') {
            user.audioTrack.play();
          }
        });
        
        this.client.on('user-left', (user) => {
          console.log('Remote user left:', user.uid);
          if (onUserLeft) onUserLeft(user);
        });
        
        this.eventsInitialized = true;
      }
      
      // Join the channel
      const joinedUid = uid || Math.floor(Math.random() * 100000);
      
      console.log(`Joining channel "${channelName}" with UID: ${joinedUid}`);
      
      // Handle development environment without token
      if (!token && process.env.NODE_ENV === 'development') {
        console.log('Joining channel without token in development mode');
        await this.client.join(
          this.appId,
          channelName,
          null,
          joinedUid
        );
      } else {
        // Normal join with token
        await this.client.join(
          this.appId,
          channelName,
          token,
          joinedUid
        );
      }
      
      // Create and publish local tracks
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      this.localAudioTrack = microphoneTrack;
      this.localVideoTrack = cameraTrack;
      await this.client.publish([microphoneTrack, cameraTrack]);
      
      console.log('Joined channel successfully');
      
      this.isJoining = false;
      return {
        uid: joinedUid,
        audioTrack: microphoneTrack,
        videoTrack: cameraTrack
      };
    } catch (error) {
      this.isJoining = false;
      console.error('Error joining Agora channel:', error);
      throw error;
    }
  }

  async leaveChannel() {
    try {
      console.log('Leaving Agora channel...');
      
      // Unpublish and close local tracks
      if (this.localAudioTrack || this.localVideoTrack) {
        await this.client?.unpublish([this.localAudioTrack, this.localVideoTrack]);
      }
      
      this.localAudioTrack?.close();
      this.localVideoTrack?.close();
      
      // Leave the channel
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

  // Mute/unmute local audio
  toggleMute() {
    if (this.localAudioTrack) {
      const muted = !this.localAudioTrack.muted;
      this.localAudioTrack.setMuted(muted);
      return muted;
    }
    return false;
  }

  // Enable/disable local video
  toggleVideo() {
    if (this.localVideoTrack) {
      const disabled = !this.localVideoTrack.muted;
      this.localVideoTrack.setMuted(disabled);
      return disabled;
    }
    return false;
  }
}

export default new AgoraService();