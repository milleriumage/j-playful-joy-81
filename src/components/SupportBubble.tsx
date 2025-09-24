import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail } from 'lucide-react';
import { SupportDialog } from '@/components/SupportDialog';
import { MessagePreviewDialog } from '@/components/MessagePreviewDialog';
import { AdminCreditsDialog } from '@/components/AdminCreditsDialog';

export default function SupportBubble() {
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Message with Preview Button */}
      <Button
        onClick={() => setShowPreviewDialog(true)}
        className="rounded-full h-14 w-14 shadow-lg bg-green-600 hover:bg-green-700 text-white mb-2"
        size="icon"
        title="Message with Preview"
      >
        <Mail size={24} />
      </Button>

      {/* General Support Button */}
      <Button
        onClick={() => setShowSupportDialog(true)}
        className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 text-white"
        size="icon"
        title="General Support"
      >
        <MessageSquare size={24} />
      </Button>
      
      {/* Admin Credits Dialog */}
      <AdminCreditsDialog
        isOpen={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
      />

      {/* Support Dialog */}
      <SupportDialog 
        isOpen={showSupportDialog} 
        setIsOpen={setShowSupportDialog} 
      />

      {/* Preview Dialog */}
      <MessagePreviewDialog 
        isOpen={showPreviewDialog} 
        setIsOpen={setShowPreviewDialog} 
      />
    </div>
  );
}