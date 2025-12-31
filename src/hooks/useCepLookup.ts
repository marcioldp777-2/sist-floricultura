import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function useCepLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const lookupCep = useCallback(async (cep: string): Promise<AddressData | null> => {
    const cleanCep = cep.replace(/\D/g, "");
    
    if (cleanCep.length !== 8) {
      return null;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro ao consultar CEP");
      }

      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado e tente novamente.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Endereço encontrado",
        description: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`,
      });

      return {
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      };
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível consultar o CEP. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const formatCep = (value: string): string => {
    const numbers = value.replace(/\D/g, "").slice(0, 8);
    if (numbers.length > 5) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    }
    return numbers;
  };

  return { lookupCep, isLoading, formatCep };
}
