// ... Imports anteriores ...
// Adicione este novo estado e interface
interface NegotiationData { commission: string; region: string; }

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  // ... Estados anteriores ...
  // Novo estado para o Modal de Aprovação
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionRequest | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationData>({ commission: "10", region: "" });

  // ... Fetchers mantidos ...

  // SUBSTITUA a função handleConnectionAction antiga por esta lógica de abrir modal
  const openApprovalModal = (conn: ConnectionRequest) => {
      setSelectedConnection(conn);
      setNegotiation({ commission: "10", region: conn.application_data?.regions || "" }); // Puxa a sugestão do cliente
      setIsApproveOpen(true);
  };

  // NOVA FUNÇÃO: Efetivar a Aprovação com Regras
  const confirmApproval = async () => {
      if (!selectedConnection) return;
      setLoading(true);
      
      const { error } = await supabase
        .from('commercial_connections')
        .update({ 
            status: 'approved',
            commission_rate: parseFloat(negotiation.commission),
            authorized_regions: [negotiation.region] // Salva como array
        })
        .eq('id', selectedConnection.id);

      if (!error) {
          toast({ title: "Parceiro Homologado", description: `Comissão definida em ${negotiation.commission}%`, className: "bg-[#103927] text-white" });
          fetchConnections();
          setIsApproveOpen(false);
      } else {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
      setLoading(false);
  };

  const rejectConnection = async (id: string) => {
      await supabase.from('commercial_connections').update({ status: 'rejected' }).eq('id', id);
      toast({ title: "Solicitação Rejeitada" });
      fetchConnections();
  };

  // ... Resto do código igual, exceto na renderização da ABA PARTNERS ...

  // Na Aba Partners, atualize os botões do card de solicitação:
  /*
    <div className="flex gap-3">
        <Button onClick={() => rejectConnection(conn.id)} variant="ghost" className="rounded-full hover:text-destructive">Recusar</Button>
        <Button onClick={() => openApprovalModal(conn)} className="rounded-full bg-[#103927] hover:bg-[#0A261A] text-white px-6">Analisar & Aprovar</Button>
    </div>
  */

  // E adicione o Dialog de Aprovação no final do return, antes do fechamento da div principal
  /*
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="rounded-3xl p-8">
            <DialogHeader><DialogTitle className="font-serif text-2xl">Homologar Parceiro</DialogTitle><DialogDescription>Defina as regras comerciais para este especificador.</DialogDescription></DialogHeader>
            
            {selectedConnection && (
                <div className="bg-secondary/10 p-4 rounded-xl mb-4 text-sm space-y-1">
                    <p><strong>Candidato:</strong> {selectedConnection.application_data.document}</p>
                    <p><strong>Modelo Solicitado:</strong> {selectedConnection.application_data.salesModel?.toUpperCase()}</p>
                    <p><strong>Logística:</strong> {selectedConnection.application_data.logistics?.toUpperCase()}</p>
                </div>
            )}

            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label>Comissão Autorizada (%)</Label>
                    <Input type="number" className="h-12 rounded-xl text-lg font-medium" value={negotiation.commission} onChange={(e) => setNegotiation({...negotiation, commission: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Região de Atuação Autorizada</Label>
                    <Input className="h-12 rounded-xl" value={negotiation.region} onChange={(e) => setNegotiation({...negotiation, region: e.target.value})} />
                    <p className="text-xs text-muted-foreground">Delimite onde este parceiro pode vender seus produtos.</p>
                </div>
            </div>

            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsApproveOpen(false)} className="rounded-xl">Cancelar</Button>
                <Button onClick={confirmApproval} className="rounded-xl bg-[#103927] text-white px-8">Confirmar Homologação</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
  */
  
  // ... Retorno do componente