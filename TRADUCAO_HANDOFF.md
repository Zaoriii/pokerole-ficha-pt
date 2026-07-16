# Handoff — Tradução PT-BR do poke-e-role

Este documento existe para que qualquer IA (ou pessoa) consiga continuar esta
tradução sem precisar reconstruir o contexto do zero. Leia isto antes de tocar
em qualquer arquivo.

## O que é este projeto

`poke-e-role` é uma ficha de personagem digital (React + TypeScript + Vite)
para um RPG de mesa baseado em Pokémon (sistema estilo Pokérole). Repositório
original: https://github.com/lordcongra/poke-e-role

O objetivo é traduzir **apenas o texto visível ao usuário** (labels, botões,
títulos, tooltips, placeholders, mensagens) para português do Brasil, mantendo
100% da lógica, estrutura de arquivos, nomes de variáveis/funções e
comportamento do app intactos.

## Regras que estão sendo seguidas (não flexibilizar)

1. **Nunca reescrever lógica.** Só o texto entre tags JSX, `placeholder=`,
   `title=`, mensagens de string literais visíveis. Nomes de variáveis,
   funções, chaves de objeto, valores comparados em `if`/`switch`/`===`
   **não são tocados**, a menos que a tradução seja coordenada em todos os
   pontos que dependem daquele valor (ver seção "Pendências" abaixo).
2. **Nunca apagar ou recriar arquivos.** Edição é sempre in-place, arquivo por
   arquivo, com `str_replace` (troca cirúrgica de string), nunca reescrevendo
   o arquivo inteiro do zero.
3. **Manter os mesmos caminhos e nomes de arquivo.** A estrutura de pastas do
   projeto original nunca muda.
4. **Não tocar em:** `package.json`, `package-lock.json`, `tsconfig*.json`,
   `vite.config.ts`, nem nos arquivos de `src/utils/` ou `src/types/` (são
   lógica pura, sem texto de interface).
5. **Não traduzir ainda os JSONs de `public/dataset/`** (pokédex, golpes,
   habilidades, itens — mais de 2000 arquivos). Isso é um projeto separado,
   maior, que precisa de um script com glossário centralizado em vez de
   edição manual arquivo por arquivo. Não começar isso sem alinhar com o
   usuário.

## Glossário de termos já usado (manter consistência!)

| Inglês | PT-BR usado |
|---|---|
| Buff | Bônus |
| Debuff | Penalidade |
| Total | Total |
| Base | Base |
| Rank | Rank (mantido, termo de sistema) |
| Remaining | Restante |
| Extra | Extra |
| SKILLS | PERÍCIAS |
| CORE ATTRIBUTES | ATRIBUTOS BASE |
| SOCIAL ATTRIBUTES | ATRIBUTOS SOCIAIS |
| FIGHT (categoria de perícia) | LUTA |
| SURVIVE (categoria) | SOBREVIVÊNCIA |
| SOCIAL (categoria) | SOCIAL |
| KNOWLEDGE (categoria) | CONHECIMENTO |
| Brawl | Briga |
| Channel / Throw (Trainer) | Canalização / Arremesso |
| Clash / Weapon (Trainer) | Confronto / Arma |
| Evasion | Evasão |
| Alert | Alerta |
| Athletic | Atletismo |
| Nature | Natureza |
| Stealth | Furtividade |
| Charm / Empathy (Trainer) | Charme / Empatia |
| Etiquette | Etiqueta |
| Intimidate | Intimidação |
| Perform | Atuação |
| Crafts | Ofícios |
| Lore | Conhecimento Geral |
| Medicine | Medicina |
| Magic / Science (Trainer) | Magia / Ciência |
| TOUGH (contest stat) | RESISTENTE |
| COOL (contest stat) | LEGAL |
| BEAUTY (contest stat) | BONITO |
| CUTE (contest stat) | FOFO |
| CLEVER (contest stat) | ESPERTO |
| Cancel | Cancelar |
| Delete | Excluir |
| Confirm Deletion | Confirmar Exclusão |
| ACC (label abreviado, golpes) | PRE |
| DMG (label abreviado, golpes) | DANO |
| Physical (categoria de golpe, texto exibido) | Físico / Fís (abreviado) |
| Special (categoria de golpe, texto exibido) | Especial / Esp (abreviado) |
| Status (categoria de golpe, texto exibido "Support"/"Supp") | Suporte / Sup (abreviado) |
| Banked (dice) | Guardado(s) |
| Unnamed (fallback de nome) | Sem nome |
| Succ (label abreviado, modificador) | Suc |
| Pain (label, modificador de dor) | Dor |
| Pool (dice pool, termo de sistema) | Pool (mantido) |
| Sort (coluna/ação) | Ordem |
| Learnset | Golpes Aprendidos |
| STAB (termo de sistema) | STAB (mantido) |
| Overrank (termo de sistema) | Overrank (mantido) |
| TM / Technical Machine | MT / Máquina Técnica |
| Loot / Random Loot Generator | Itens / Gerador de Itens Aleatórios |
| Reroll | Rolar de Novo |
| Broadcast (botão de enviar info ao chat) | Transmitir |
| Close (botão) | Fechar |
| Ruleset | Conjunto de Regras |
| Loot Generator | Gerador de Itens |
| Type Matchups | Efetividades de Tipo (já usado em `board/TypeMatchups.tsx`) |
| Enabled/Disabled (system value, ex. Pain Penalties) | Ativado/Desativado |
| Turn (combat turn, initiative tracker) | Turno |
| Room (Owlbear Rodeo room) | Sala |

## Pendência importante — NÃO resolvida ainda

Em `src/components/ui/ResourceBox.tsx`, os títulos "HP" e "WILL" **não foram
traduzidos de propósito**. Esses valores chegam via prop `title` a partir de
`src/components/board/DerivedBoard.tsx` (`title="HP"` / `title="WILL"`), e
dentro do `ResourceBox` existe uma comparação de string (`title === 'HP'`)
que decide a cor da barra de vida. Traduzir isso exige mudar os dois
arquivos **ao mesmo tempo** (o valor passado e a comparação), senão a lógica
de cor quebra. Ainda não foi decidido com o usuário se o app deve mostrar
"HP"/"WILL" (comum mesmo em fãs BR) ou "PV"/"VONTADE". Perguntar antes de
mudar.

## Pendência importante #2 — NÃO resolvida ainda

Em `src/components/modals/ItemGeneratorModal.tsx`, os labels de raridade
exibidos diretamente como `{rarity}` ('Common', 'Uncommon', 'Rare',
'Very Rare', 'Legendary') **não foram traduzidos de propósito**. Esses
mesmos textos são usados como chaves do estado `rarityFilters` e são
comparados diretamente em `src/utils/lootGeneratorLogic.ts`
(`rarityFilters[rarityStr]`, `rarityStr === 'Common'` etc. — arquivo de
`src/utils/`, fora de escopo pela regra 4). Traduzir o texto exibido exigiria
uma função de mapeamento nova (chave em inglês → label em PT-BR), igual ao
caso já documentado em `DualScaleModal.tsx`. Ainda não foi alinhado com o
usuário. Mesma pendência vale para os nomes de tipo de Pokémon (`{type}` em
`ItemGeneratorTmFilters.tsx`), que vêm de `POKEMON_TYPES`/dataset ainda em
inglês.

## O que já foi traduzido (não repetir)

- `src/components/ui/` — todos os 6 arquivos (`CategoryHeader`,
  `CollapsingSection`, `CustomInfoRow`, `NumberSpinner`, `ResourceBox`,
  `TooltipIcon`)
- `src/components/tables/CoreTable.tsx`
- `src/components/tables/SkillRow.tsx` (não precisou de mudança — sem texto
  fixo de UI)
- `src/components/tables/SkillsTable.tsx`
- `src/components/tables/SocialTable.tsx`
- `src/components/tables/ActionRolls.tsx`
- `src/components/tables/InventoryItemRow.tsx`
- `src/components/tables/InventoryTable.tsx`
- `src/components/tables/MoveCard.tsx` (pendência: opção `<option value="will">WILL</option>` não traduzida — mesmo caso do HP/WILL)
- `src/components/tables/MoveRow.tsx` (mesma pendência do WILL acima)
- `src/components/tables/MovesTable.tsx` (pendência: regex `/set damage\s*(\d+)?/i` que lê a descrição do golpe digitada pelo usuário — texto de busca "set damage" NÃO traduzido de propósito, só a mensagem de saída foi traduzida)
- `src/components/tables/MovesTableLearnset.tsx` (nomes de rank e de golpe vêm do dataset/personagem, não traduzidos — fora de escopo)
- `src/components/tables/MovesTableModifiers.tsx`

**`src/components/tables/` está 100% concluída.**
- (De uma etapa anterior, já vinham prontos) `App.tsx`,
  `components/board/*` inteira, `components/identity/*` inteira,
  `components/modals/ClashModal.tsx`, `RestModal.tsx`,
  `TakeChancesModal.tsx`
- `src/components/modals/ChangelogModal.tsx` (conteúdo de `log.changes` vem de
  `src/data/changelog.tsx`, ainda não traduzido — fora de escopo aqui)
- `src/components/modals/DemoRollModal.tsx`
- `src/components/modals/DualScaleModal.tsx` (pendência: `{opt}` de
  `categoryOptions` exibe "Physical"/"Special"/"Status" cru, sem tradução —
  exigiria adicionar uma função de mapeamento nova; alinhar com o usuário
  antes de mudar)
- `src/components/modals/GeneratorModal.tsx` (todos os `value=` de selects —
  buildType, combatBias, coveragePreference — mantidos intactos por serem
  usados em `generatorConfig`/`generatorUtils.ts`; só o texto exibido foi
  traduzido. "STAB" mantido como termo de sistema.)
- `src/components/modals/GeneratorPreviewModal.tsx` (pendência: objeto
  `STAT_NAMES` ('Strength', 'Dexterity', 'Vitality', 'Special', 'Insight')
  usado como chave de busca em `getLimit(pokemonData, ...)` contra o dataset
  da Pokédex — NÃO traduzido, pois o dataset ainda está em inglês)
- `src/components/modals/GeneratorPreviewMoveRow.tsx`
- `src/components/modals/GeneratorPreviewStatSpinner.tsx` (não precisou de
  mudança — só símbolos +/-)
- `src/components/modals/GlobalModifiersModal.tsx`
- `src/components/modals/InitiativeSettingsModal.tsx` (todos os `value=` de
  select mantidos intactos, só o texto exibido foi traduzido)
- `src/components/modals/ItemGeneratorModal.tsx` (pendência: labels de
  raridade `{rarity}` não traduzidos — ver "Pendência importante #2" acima)
- `src/components/modals/ItemGeneratorPocketGroup.tsx` (não precisou de
  mudança — labels vêm de `formatCamelCase` sobre chaves do dataset, fora de
  escopo)
- `src/components/modals/ItemGeneratorResultModal.tsx`
- `src/components/modals/ItemGeneratorTmFilters.tsx` (pendência: `{type}`
  dos pills/opções de tipo de Pokémon não traduzido — vem de
  `POKEMON_TYPES`/dataset ainda em inglês, mesma pendência #2 acima)
- `src/components/modals/ItemInfoModal.tsx`
- `src/components/modals/MoveEditModal.tsx`
- `src/components/modals/PokedexModal.tsx`
- `src/components/modals/PrintSettingsModal.tsx`
- `src/components/modals/RulesModal.tsx` (pendência resolvida com coordenação:
  as opções de "Pain Penalties" não tinham `value=` explícito — igual ao
  texto exibido "Enabled"/"Disabled" era o próprio valor armazenado e
  comparado em `TrackerSection.tsx`, `MovesTable.tsx`, `combatMath.ts` e
  `GlobalModifiersModal.tsx`. Adicionei `value="Enabled"`/`value="Disabled"`
  explícitos nas options e traduzi só o texto exibido para "Ativado"/
  "Desativado", mantendo o valor armazenado idêntico — lógica intacta. Os
  demais selects do arquivo (`homebrewAccess`, `gmOnlyLootGen`,
  `gmOnlyMatchups`, `gmDemoMode`) já usavam `value=` explícito, então só o
  texto visível foi traduzido, mantendo os valores.)
- `src/components/modals/SmartTagsGuideModal.tsx` (as tags de exemplo entre
  `<code>` como `[Dex -2]`, `[High Crit]` etc. **não foram traduzidas de
  propósito** — são sintaxe literal lida por regex em `src/utils/tagParser.ts`
  com palavras-chave fixas em inglês; só o texto explicativo ao redor foi
  traduzido)
- `src/components/modals/SpeciesChangeModal.tsx`
- `src/components/modals/TagBuilderModal.tsx` (pendência: as opções do
  segundo/terceiro `<select>` — `getTargetOptions()` e `dynamicTypeOptions`,
  ex. "High Crit", "Recoil", "Def", "Spd" — **não foram traduzidas de
  propósito**. Ali `value={o}` é o próprio texto exibido, comparado
  diretamente em `handleConfirm` para montar a tag final gravada na
  descrição, ex. `target === 'High Crit'` gera `[High Crit]`. Traduzir
  exigiria separar chave/label como um remapeamento maior — mesmo padrão da
  Pendência #1 (HP/WILL) e #2 (rarity), só que aqui a lista é grande (~50
  valores possíveis). Só a categoria (primeiro select, que já tinha
  `value=` separado do texto) e os textos fixos ao redor foram traduzidos.)
- `src/components/modals/TargetingModal.tsx`
- `src/components/modals/TrackerBadgeColors.tsx` (labels, tooltips, botões e
  mensagem de `OBR.notification.show` traduzidos; nomes de propriedades de
  estado como `colorAct`/`colorEva`/`colorCla` intactos)
- `src/components/modals/TrackerPlacementModal.tsx` ("HP Bar"/"Will Bar"
  traduzidos como "Barra de HP"/"Barra de Will" — mantendo as siglas HP/Will
  intactas, coerente com a Pendência #1 ainda não resolvida; nenhuma dessas
  strings é comparada em lógica, então não há risco de quebra)
- `src/components/modals/TrackerSettingsModal.tsx`
- `src/components/modals/TrackerVisibilityToggles.tsx`
- `src/components/modals/TransformationModal.tsx` (textos de descrição,
  labels, selects, botões, `window.prompt` e todas as mensagens de
  `OBR.notification.show` traduzidos. Nomes de tipo de Pokémon exibidos em
  `{type}` dentro do select de Afinidade Tera **não foram traduzidos** —
  vêm de `POKEMON_TYPES`/dataset ainda em inglês, mesma pendência #2 já
  documentada em outros arquivos)

**`src/components/modals/` está 100% concluída.**

- `src/components/initiative/InitiativeTracker.tsx` (tooltips "Remove from
  Initiative"/"Previous Turn"/"Next Turn" e as mensagens de estado
  "Connecting to Room..."/"Waiting for rolls..." traduzidos. Nenhuma dessas
  strings é comparada em lógica — só exibição. `src/initiative-tracker.tsx`
  (entry point/bootstrap) não tinha texto de UI, nada a traduzir.
  `initiative-tracker.html` mantido como estava — o `<title>` não foi
  alterado, mesmo padrão já usado em `index.html`, que também manteve seu
  `<title>` original.)

## O que falta (nesta ordem sugerida)

**`src/components/homebrew/`** (inteira, ~19 arquivos): AbilityCard,
HomebrewAbilities, HomebrewFormCard, HomebrewForms, HomebrewItemCard,
HomebrewItems, HomebrewModal, HomebrewMoveCard, HomebrewMoves,
HomebrewPokemon, HomebrewPokemonAbilities, HomebrewPokemonCard,
HomebrewPokemonLearnset, HomebrewPokemonStats, HomebrewStatusCard,
HomebrewStatuses, HomebrewTypeEditor, HomebrewTypeMatchupPills,
HomebrewTypes, LearnsetMoveRow

**Outros:**
- `src/components/print/PrintSheet.tsx`
- `src/data/changelog.tsx`
- `src/roll-log.tsx`

**Ainda não iniciado (projeto à parte):** os ~2000+ JSONs em
`public/dataset/` (pokedex, moves, items, abilities, natures).

## Como continuar

Para cada arquivo pendente:
1. `view` o arquivo inteiro primeiro.
2. Identificar apenas texto visível (JSX text nodes, `placeholder`, `title`,
   `alt`, mensagens de string usadas em `<span>`, `<button>`, etc).
3. Verificar se aquela string também é usada em alguma comparação lógica
   (`===`, `switch`, chave de objeto) antes de traduzir — se for, tratar como
   a pendência do HP/WILL acima: não traduzir sozinho, documentar e perguntar.
4. Usar `str_replace` (nunca reescrever o arquivo inteiro).
5. Reaproveitar os termos do glossário acima sempre que o mesmo conceito
   aparecer de novo.
6. Ao terminar um lote, atualizar este arquivo (`TRADUCAO_HANDOFF.md`),
   movendo os arquivos concluídos da seção "falta" para "já foi traduzido",
   e registrando novos termos de glossário se surgirem.
