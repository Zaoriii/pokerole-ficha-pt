import OBR from '@owlbear-rodeo/sdk';
import { useCharacterStore } from '../../store/useCharacterStore';
import './ItemGeneratorResultModal.css';

interface ItemGeneratorResultModalProps {
    item: { name: string; description: string };
    onClose: () => void;
    onReroll: () => void;
}

export function ItemGeneratorResultModal({ item, onClose, onReroll }: ItemGeneratorResultModalProps) {
    const addSpecificInventoryItem = useCharacterStore((state) => state.addSpecificInventoryItem);

    const handleAddToBag = () => {
        addSpecificInventoryItem({
            name: item.name,
            description: item.description,
            quantity: 1,
            active: false
        });
        if (OBR.isAvailable) OBR.notification.show(`✅ ${item.name} adicionado ao inventário!`, 'SUCCESS');
        onClose();
    };

    return (
        <div className="item-generator-result-modal__overlay">
            <div className="item-generator-result-modal__content">
                <div className="item-generator-result-modal__name">{item.name}</div>
                <div className="item-generator-result-modal__desc">{item.description}</div>

                <div className="item-generator-result-modal__actions">
                    <button
                        type="button"
                        onClick={onReroll}
                        className="item-generator-result-modal__btn item-generator-result-modal__btn--reroll"
                    >
                        🎲 Rolar de Novo
                    </button>
                    <button
                        type="button"
                        onClick={handleAddToBag}
                        className="item-generator-result-modal__btn item-generator-result-modal__btn--add"
                    >
                        🎒 Adicionar à Mochila
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="item-generator-result-modal__btn item-generator-result-modal__btn--close"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
