import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Reutilizar o componente Button se adequado
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Para o tooltip

const AdminButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white transition-colors duration-150 z-50"
            aria-label="Acesso administrativo"
          >
            <Link to="/admin">
              <Settings className="h-6 w-6" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Acesso administrativo</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AdminButton;
