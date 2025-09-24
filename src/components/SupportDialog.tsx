import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const SupportDialog = ({
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
          subject: `[Support] ${subject}`,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            💬 General Support
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Contact us for questions or issues with your account
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="support-email">Email</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              placeholder="How can we help you?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              placeholder="Describe your question or problem..."
              rows={4}
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
            {isLoading ? 'Sending...' : 'Ask for Help'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};