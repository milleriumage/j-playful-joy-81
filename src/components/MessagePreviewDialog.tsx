import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const MessagePreviewDialog = ({
  isOpen,
  setIsOpen
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!email || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-message', {
        body: {
          email: 'linkteamcreators@gmail.com',
          subject: `[Message] ${subject}`,
          message: `
            User email: ${email}
            Subject: ${subject}
            
            Message:
            ${message}
          `
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Message sent successfully!');
      setEmail('');
      setSubject('');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            ✉️ Message with Preview
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Compose your message and preview before sending
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Compose Message</h3>
            
            <div>
              <Label htmlFor="preview-email">Email</Label>
              <Input
                id="preview-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="preview-subject">Subject</Label>
              <Input
                id="preview-subject"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="preview-message">Message</Label>
              <Textarea
                id="preview-message"
                placeholder="Type your message here..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="w-full"
            >
              <Send size={16} className="mr-2" />
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
          
          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye size={20} />
              Preview
            </h3>
            
            <div className="border rounded-lg p-4 bg-muted/50 min-h-[400px]">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">From:</Label>
                  <p className="text-sm font-medium">{email || 'your@email.com'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">To:</Label>
                  <p className="text-sm font-medium">linkteamcreators@gmail.com</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subject:</Label>
                  <p className="text-sm font-medium">{subject || 'Enter subject'}</p>
                </div>
                
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Message:</Label>
                  <div className="text-sm bg-background border rounded p-3 mt-2 min-h-[200px] whitespace-pre-line">
                    {message || 'Type your message to see preview...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};