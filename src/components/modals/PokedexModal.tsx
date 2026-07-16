import { useCharacterStore } from '../../store/useCharacterStore';
import { broadcastInfo } from '../../utils/diceRoller';
import './PokedexModal.css';

interface PokedexModalProps {
    onClose: () => void;
}

export function PokedexModal({ onClose }: PokedexModalProps) {
    const identity = useCharacterStore((state) => state.identity);

    const handleBroadcast = () => {
        const desc = `Espécie: ${identity.species || '???'}\nNº na Dex: ${identity.dexId || '???'}\nCategoria: ${identity.dexCategory || '???'}\nAltura: ${identity.height || '???'}\nPeso: ${identity.weight || '???'}\n\n${identity.dexDescription || 'Nenhuma descrição disponível.'}`;
        broadcastInfo(`Pokédex: ${identity.species || 'Desconhecido'}`, desc);
        onClose();
    };

    return (
        <div className="pokedex-modal__overlay">
            <div className="pokedex-modal__content">
                <div className="pokedex-modal__header">
                    <h3 className="pokedex-modal__title">📖 Dados da Pokédex</h3>
                    <button onClick={onClose} className="pokedex-modal__close-btn" title="Fechar">
                        X
                    </button>
                </div>

                <div className="pokedex-modal__body">
                    <div className="pokedex-modal__row">
                        <span className="pokedex-modal__label">Espécie:</span>
                        <span className="pokedex-modal__value">{identity.species || '???'}</span>
                    </div>
                    <div className="pokedex-modal__row">
                        <span className="pokedex-modal__label">Nº na Dex:</span>
                        <span className="pokedex-modal__value">{identity.dexId || '???'}</span>
                    </div>
                    <div className="pokedex-modal__row">
                        <span className="pokedex-modal__label">Categoria:</span>
                        <span className="pokedex-modal__value">{identity.dexCategory || '???'}</span>
                    </div>
                    <div className="pokedex-modal__row">
                        <span className="pokedex-modal__label">Altura:</span>
                        <span className="pokedex-modal__value">{identity.height || '???'}</span>
                    </div>
                    <div className="pokedex-modal__row">
                        <span className="pokedex-modal__label">Peso:</span>
                        <span className="pokedex-modal__value">{identity.weight || '???'}</span>
                    </div>

                    <div className="pokedex-modal__desc-box">
                        {identity.dexDescription || 'Nenhuma descrição disponível.'}
                    </div>
                </div>

                <div className="pokedex-modal__actions">
                    <button className="action-button action-button--dark pokedex-modal__btn" onClick={onClose}>
                        Fechar
                    </button>
                    <button
                        className="action-button pokedex-modal__btn"
                        style={{ backgroundColor: '#1565c0', borderColor: '#1565c0', color: 'white' }}
                        onClick={handleBroadcast}
                    >
                        📢 Transmitir
                    </button>
                </div>
            </div>
        </div>
    );
}
