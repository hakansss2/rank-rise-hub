
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface Boost {
  id: string;
  userId: string;
  currentRank: number;
  targetRank: number;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  boosterId?: string;
  boosterUsername?: string;
  createdAt: string;
  messages: Message[];
  gameUsername?: string;
  gamePassword?: string;
}

interface BoostMessagesDialogProps {
  boost: Boost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BoostMessagesDialog: React.FC<BoostMessagesDialogProps> = ({ boost, open, onOpenChange }) => {
  if (!boost) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      console.error("Invalid date format:", dateString, error);
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-valorant-black border border-valorant-gray/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span>Boost Mesajları</span>
            {boost.messages.length > 0 && (
              <Badge className="bg-valorant-green/10 text-valorant-green border-valorant-green/30">
                {boost.messages.length}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Boost ID: {boost.id} / Müşteri: {boost.userId} / Booster: {boost.boosterUsername || "Atanmamış"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {boost.gameUsername && boost.gamePassword && (
            <div className="mb-6 p-4 border border-valorant-gray/30 rounded-md bg-valorant-gray/10">
              <h3 className="font-bold mb-2 text-white">Hesap Bilgileri</h3>
              <p className="text-gray-300">Kullanıcı Adı: <span className="font-mono bg-valorant-gray/20 px-2 py-1 rounded">{boost.gameUsername}</span></p>
              <p className="text-gray-300">Şifre: <span className="font-mono bg-valorant-gray/20 px-2 py-1 rounded">{boost.gamePassword}</span></p>
            </div>
          )}
          
          <div className="space-y-4">
            {boost.messages.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                {boost.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg mb-4 ${
                      message.senderId === boost.userId 
                        ? 'bg-blue-500/10 border border-blue-500/20' 
                        : 'bg-green-500/10 border border-green-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.senderName}
                        {message.senderId === boost.userId ? ' (Müşteri)' : ' (Booster)'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(message.timestamp)}</span>
                    </div>
                    <p className="text-gray-100">{message.content}</p>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="text-center py-10 text-gray-400">
                Bu boost için henüz mesaj yok.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostMessagesDialog;
