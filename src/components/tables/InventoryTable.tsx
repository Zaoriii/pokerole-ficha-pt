import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { fetchItemData } from '../../utils/api';
import { KNOWN_ITEMS } from '../../data/constants';
import { TagBuilderModal } from '../modals/TagBuilderModal';
import { TooltipIcon } from '../ui/TooltipIcon';
import { CollapsingSection } from '../ui/CollapsingSection';
import { InventoryItemRow } from './InventoryItemRow';
import { ItemInfoModal } from '../modals/ItemInfoModal';
import { SmartTagsGuideModal } from '../modals/SmartTagsGuideModal';
import './InventoryTable.css';

export function InventoryTable() {
    const role = useCharacterStore((state) => state.role);
    const inventory = useCharacterStore((state) => state.inventory);
    const roomCustomItems = useCharacterStore((state) => state.roomCustomItems);

    const addInventoryItem = useCharacterStore((state) => state.addInventoryItem);
    const removeInventoryItem = useCharacterStore((state) => state.removeInventoryItem);

    const notes = useCharacterStore((state) => state.notes);
    const setNotes = useCharacterStore((state) => state.setNotes);

    const trainingPoints = useCharacterStore((state) => state.tp);
    const pokedollars = useCharacterStore((state) => state.currency);
    const setTrainingPoints = useCharacterStore((state) => state.setTp);
    const setPokedollars = useCharacterStore((state) => state.setCurrency);

    const [infoModal, setInfoModal] = useState<{ title: string; desc: string } | null>(null);
    const [tagBuilderData, setTagBuilderData] = useState<{
        id: string;
        type: 'item' | 'move' | 'homebrew_ability' | 'homebrew_move' | 'homebrew_item';
    } | null>(null);
    const [fetchingItems, setFetchingItems] = useState<Record<string, boolean>>({});

    const [showTagsGuide, setShowTagsGuide] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

    const activeCount = inventory.filter((item) => item.active).length;
    const customItemNames = roomCustomItems.filter((item) => role === 'GM' || !item.gmOnly).map((item) => item.name);

    const handleInfoClick = async (id: string, name: string, descriptionFallback: string) => {
        if (!name) {
            setInfoModal({ title: 'Item Desconhecido', desc: descriptionFallback || 'Sem descrição.' });
            return;
        }
        setFetchingItems((previous) => ({ ...previous, [id]: true }));
        setInfoModal({ title: name, desc: 'Carregando...' });

        const data = await fetchItemData(name);
        if (data) {
            setInfoModal({
                title: name,
                desc: String(data.Description || data.Effect || descriptionFallback || 'Nenhuma descrição encontrada.')
            });
        } else {
            setInfoModal({ title: name, desc: descriptionFallback || 'Nenhuma descrição encontrada.' });
        }
        setFetchingItems((previous) => ({ ...previous, [id]: false }));
    };

    const bagHeaderElements = (
        <>
            <TooltipIcon onClick={() => setShowTagsGuide(true)} />
            {activeCount > 1 && <div className="inventory-table__warning">⚠️ Múltiplos itens ativos</div>}
            <div className="inventory-table__currency-container">
                <span className="inventory-table__currency-tp" title="Pontos de Treinamento">
                    PT:{' '}
                    <input
                        type="number"
                        value={trainingPoints}
                        onChange={(event) => setTrainingPoints(Number(event.target.value) || 0)}
                        className="no-spinners inventory-table__currency-input inventory-table__currency-input--tp"
                    />
                </span>
                <span className="inventory-table__currency-pd">
                    PD:{' '}
                    <input
                        type="number"
                        value={pokedollars}
                        onChange={(event) => setPokedollars(Number(event.target.value) || 0)}
                        className="no-spinners inventory-table__currency-input"
                    />
                </span>
            </div>
        </>
    );

    return (
        <div className="inventory-table__container">
            <datalist id="item-list">
                {[...KNOWN_ITEMS.map((item) => item.name), ...customItemNames].map((itemName) => (
                    <option key={itemName} value={itemName} />
                ))}
            </datalist>

            <CollapsingSection title="MOCHILA" headerElements={bagHeaderElements}>
                <div className="table-responsive-wrapper">
                    <table className="data-table inventory-table__table">
                        <thead>
                            <tr className="inventory-table__header-row">
                                <th className="inventory-table__header-cell-check" title="Equipado?">
                                    ✔
                                </th>
                                <th className="inventory-table__header-cell-qty">Qtd</th>
                                <th className="inventory-table__header-cell-name">Nome do Item</th>
                                <th>Efeito / Notas</th>
                                <th className="inventory-table__header-cell-sort">Ordem</th>
                                <th className="inventory-table__header-cell-del">Exc.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item) => (
                                <InventoryItemRow
                                    key={item.id}
                                    item={item}
                                    handleInfoClick={handleInfoClick}
                                    fetchingItems={fetchingItems}
                                    setTagBuilderData={setTagBuilderData}
                                    setDeleteItemId={setDeleteItemId}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <button
                    type="button"
                    onClick={addInventoryItem}
                    className="action-button action-button--dark inventory-table__add-btn"
                >
                    + Adicionar Item
                </button>
            </CollapsingSection>

            <CollapsingSection title="NOTAS">
                <textarea
                    className="inventory-table__notes-area"
                    placeholder="Adicione notas extras, traços ou histórico do personagem aqui..."
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                />
            </CollapsingSection>

            {tagBuilderData && (
                <TagBuilderModal
                    targetId={tagBuilderData.id}
                    targetType={tagBuilderData.type}
                    onClose={() => setTagBuilderData(null)}
                />
            )}

            {infoModal && <ItemInfoModal infoModal={infoModal} onClose={() => setInfoModal(null)} />}

            {showTagsGuide && <SmartTagsGuideModal onClose={() => setShowTagsGuide(false)} />}

            {deleteItemId && (
                <div className="inventory-table__modal-overlay">
                    <div className="inventory-table__modal-content">
                        <h3 className="inventory-table__modal-title">⚠️ Confirmar Exclusão</h3>
                        <p className="inventory-table__modal-text">Tem certeza de que deseja excluir este Item?</p>
                        <div className="inventory-table__modal-actions">
                            <button
                                type="button"
                                className="action-button action-button--dark inventory-table__modal-btn"
                                onClick={() => setDeleteItemId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--red inventory-table__modal-btn"
                                onClick={() => {
                                    removeInventoryItem(deleteItemId);
                                    setDeleteItemId(null);
                                }}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
