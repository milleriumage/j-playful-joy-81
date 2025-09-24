
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MediaFormProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: any;
  onUpdate: (id: string, updates: any) => void;
}

export const MediaForm = ({ isOpen, onClose, mediaItem, onUpdate }: MediaFormProps) => {
  const [formData, setFormData] = useState({
    name: mediaItem?.name || '',
    description: mediaItem?.description || '',
    price: mediaItem?.price || '',
    link: mediaItem?.link || '',
    timer: mediaItem?.timer || '',
    isBlurred: mediaItem?.is_blurred || false,
    isLocked: mediaItem?.is_locked || false,
    isMain: mediaItem?.is_main || false
  });

  const handleSave = async () => {
    if (!mediaItem) return;

    await onUpdate(mediaItem.id, {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      link: formData.link,
      timer: formData.timer ? parseInt(formData.timer) : null,
      is_blurred: formData.isBlurred,
      is_locked: formData.isLocked,
      is_main: formData.isMain
    });

    toast.success("🎯 Media updated successfully!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Edit Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Media Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter media name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description (shown on hover)"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="e.g., $9.99"
            />
          </div>

          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="timer">Timer (minutes)</Label>
            <Input
              id="timer"
              type="number"
              value={formData.timer}
              onChange={(e) => setFormData(prev => ({ ...prev, timer: e.target.value }))}
              placeholder="Auto-delete after minutes"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="blur">Blur Effect</Label>
              <Switch
                id="blur"
                checked={formData.isBlurred}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlurred: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lock">Lock Media</Label>
              <Switch
                id="lock"
                checked={formData.isLocked}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLocked: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="main">Set as Main Display</Label>
              <Switch
                id="main"
                checked={formData.isMain}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMain: checked }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
              💾 Save Changes
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
