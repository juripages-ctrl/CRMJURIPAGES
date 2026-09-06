-- 0. Atualizar a restrição (Check Constraint) para permitir planos semestrais
ALTER TABLE public.planos DROP CONSTRAINT IF EXISTS planos_periodicidade_check;
ALTER TABLE public.planos ADD CONSTRAINT planos_periodicidade_check CHECK (periodicidade IN ('mensal', 'semestral', 'anual', 'unico'));

-- 1. Plano Essencial
INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos)
SELECT nome, 650.00, 'semestral', limite_sites, recursos FROM public.planos WHERE nome = 'Plano Essencial' AND periodicidade = 'mensal';

INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos)
SELECT nome, 1150.00, 'anual', limite_sites, recursos FROM public.planos WHERE nome = 'Plano Essencial' AND periodicidade = 'mensal';


-- Plano Profissional
INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos)
SELECT nome, 1180.00, 'semestral', limite_sites, recursos FROM public.planos WHERE nome = 'Plano Profissional' AND periodicidade = 'mensal';

INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos)
SELECT nome, 2100.00, 'anual', limite_sites, recursos FROM public.planos WHERE nome = 'Plano Profissional' AND periodicidade = 'mensal';


-- Plano Premium
INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos)
SELECT nome, 1890.00, 'semestral', limite_sites, recursos FROM public.planos WHERE nome = 'Plano Premium' AND periodicidade = 'mensal';

INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos)
SELECT nome, 3360.00, 'anual', limite_sites, recursos FROM public.planos WHERE nome = 'Plano Premium' AND periodicidade = 'mensal';
