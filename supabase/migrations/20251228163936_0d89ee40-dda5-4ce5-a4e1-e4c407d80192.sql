-- Criar trigger para notificar fabricante quando receber nova solicitação de credenciamento

CREATE OR REPLACE FUNCTION public.notificar_nova_solicitacao_credenciamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fabrica_user_id uuid;
  v_fabrica_nome text;
  v_especificador_nome text;
  v_perfil text;
BEGIN
  -- Buscar user_id da fábrica
  SELECT user_id, nome INTO v_fabrica_user_id, v_fabrica_nome
  FROM public.fabrica
  WHERE id = NEW.factory_id;

  -- Buscar nome do especificador
  SELECT nome INTO v_especificador_nome
  FROM public.especificador
  WHERE id = NEW.specifier_id;

  -- Pegar o perfil do application_data
  v_perfil := COALESCE(NEW.application_data->>'perfil', 'especificador');

  -- Criar notificação para o fabricante
  INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, metadata)
  VALUES (
    v_fabrica_user_id,
    'nova_solicitacao_credenciamento',
    'Nova Solicitação de Credenciamento! 📋',
    CASE v_perfil
      WHEN 'lojista' THEN 'Um Lojista deseja se credenciar: ' || COALESCE(v_especificador_nome, 'Especificador')
      WHEN 'distribuidor' THEN 'Um Distribuidor deseja se credenciar: ' || COALESCE(v_especificador_nome, 'Especificador')
      ELSE 'Um Arquiteto/Designer deseja se credenciar: ' || COALESCE(v_especificador_nome, 'Especificador')
    END,
    jsonb_build_object(
      'connection_id', NEW.id,
      'specifier_id', NEW.specifier_id,
      'especificador_nome', v_especificador_nome,
      'perfil', v_perfil,
      'regioes', NEW.authorized_regions
    )
  );

  RETURN NEW;
END;
$$;

-- Criar trigger (drop se existir)
DROP TRIGGER IF EXISTS on_new_credenciamento ON public.commercial_connections;

CREATE TRIGGER on_new_credenciamento
  AFTER INSERT ON public.commercial_connections
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notificar_nova_solicitacao_credenciamento();

-- Trigger para notificar especificador quando credenciamento for aprovado/rejeitado
CREATE OR REPLACE FUNCTION public.notificar_resposta_credenciamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_especificador_user_id uuid;
  v_fabrica_nome text;
BEGIN
  -- Verificar se o status mudou
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Buscar user_id do especificador
  SELECT user_id INTO v_especificador_user_id
  FROM public.especificador
  WHERE id = NEW.specifier_id;

  -- Buscar nome da fábrica
  SELECT nome INTO v_fabrica_nome
  FROM public.fabrica
  WHERE id = NEW.factory_id;

  -- Notificar aprovação
  IF NEW.status = 'approved' THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, metadata)
    VALUES (
      v_especificador_user_id,
      'credenciamento_aprovado',
      'Credenciamento Aprovado! 🎉',
      'Sua solicitação de credenciamento com ' || COALESCE(v_fabrica_nome, 'a fábrica') || ' foi aprovada! Agora você pode especificar os produtos.',
      jsonb_build_object(
        'connection_id', NEW.id,
        'factory_id', NEW.factory_id,
        'fabrica_nome', v_fabrica_nome
      )
    );
  END IF;

  -- Notificar rejeição
  IF NEW.status = 'rejected' THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, metadata)
    VALUES (
      v_especificador_user_id,
      'credenciamento_rejeitado',
      'Credenciamento Não Aprovado',
      'Sua solicitação de credenciamento com ' || COALESCE(v_fabrica_nome, 'a fábrica') || ' não foi aprovada no momento.',
      jsonb_build_object(
        'connection_id', NEW.id,
        'factory_id', NEW.factory_id,
        'fabrica_nome', v_fabrica_nome
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger para resposta (drop se existir)
DROP TRIGGER IF EXISTS on_credenciamento_response ON public.commercial_connections;

CREATE TRIGGER on_credenciamento_response
  AFTER UPDATE ON public.commercial_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_resposta_credenciamento();