-- 1. Deleta os planos duplicados, mantendo apenas o plano mais antigo (original) de cada combinação de (nome, periodicidade)
DELETE FROM public.planos
WHERE id NOT IN (
    SELECT MIN(id::text)::uuid
    FROM public.planos
    GROUP BY nome, periodicidade
);
