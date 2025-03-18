
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, RefreshCw } from 'lucide-react';

const DeleteSpecificUsers: React.FC = () => {
  const { removeUsersByEmails } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteSpecificUsers = async () => {
    setLoading(true);
    try {
      const emailsToRemove = ['booster@test.com', 'customer@test.com'];
      await removeUsersByEmails(emailsToRemove);
      
      toast({
        title: "Kullanıcılar Silindi",
        description: "Belirtilen kullanıcılar başarıyla silindi.",
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Error removing specific users:", error);
      toast({
        title: "Hata",
        description: "Kullanıcılar silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)} 
        variant="outline" 
        className="border-valorant-gray/30 hover:bg-orange-500/20 text-orange-500 flex items-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Test Kullanıcılarını Sil
      </Button>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-valorant-black border border-valorant-gray/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-orange-500" />
              Test Kullanıcılarını Sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bu işlem, <strong>booster@test.com</strong> ve <strong>customer@test.com</strong> kullanıcılarını silecektir. 
              Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-valorant-gray/20 border-valorant-gray/30 text-white hover:bg-valorant-gray/30">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSpecificUsers}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Test Kullanıcılarını Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteSpecificUsers;
