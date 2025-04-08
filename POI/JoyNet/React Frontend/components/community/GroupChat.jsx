import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import VideoGrid from './VideoGrid';
import VideoCallControls from './VideoCallControls';
import { sendIceCandidate, reconnectPeer } from '../../utils/webrtc-helpers';
import { useNotification } from '../../hooks/useNotification';

// Rest of your existing GroupChat code...