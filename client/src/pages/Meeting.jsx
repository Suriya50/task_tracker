import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const Meeting = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!roomId) {
      navigate('/dashboard');
      return;
    }
  }, [roomId, navigate]);

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <main className="p-4 h-[calc(100vh-73px)]">
          <div className="w-full h-full rounded-2xl overflow-hidden glass-card">
            <iframe
              ref={iframeRef}
              src={`https://meet.jit.si/MissionDesk-${roomId}`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full border-0"
              title="Video Meeting"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Meeting;