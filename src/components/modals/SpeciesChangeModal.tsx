import { useCharacterStore } from '../../store/useCharacterStore';
import './SpeciesChangeModal.css';

interface SpeciesChangeModalProps {
    pendingSpeciesData: Record<string, unknown>;
    onClose: () => void;
}

export function SpeciesChangeModal({ pendingSpeciesData, onClose }: SpeciesChangeModalProps) {
    const applySpeciesData = useCharacterStore((state) => state.applySpeciesData);

    return (
        <div className="species-change__overlay">
            <div className="species-change__content">
                <h3 className="species-change__title">🧬 Espécie Alterada</h3>
                <p className="species-change__desc">
                    Você carregou um novo Pokémon. Como deseja lidar com os dados existentes na sua ficha?
                </p>

                <div className="species-change__btn-group">
                    <button
                        type="button"
                        onClick={() => {
                            // Evolution/Mega: Keeps skills/moves (wipeData=false), but updates stats & limits (updateStats=true)
                            applySpeciesData(pendingSpeciesData, false, true);
                            onClose();
                        }}
                        className="action-button species-change__btn-evolve"
                    >
                        ✨ Evoluir / Mega / Mudança de Forma
                        <br />
                        <span className="species-change__btn-subtitle">
                            (Atualiza Atributos, Limites e Tipo. Mantém Golpes/Perícias)
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            // Type Shift: Keeps skills/moves (wipeData=false), AND keeps custom stats/limits (updateStats=false)
                            applySpeciesData(pendingSpeciesData, false, false);
                            onClose();
                        }}
                        className="action-button species-change__btn-form"
                    >
                        🧬 Somente Mudança de Tipo/Habilidade
                        <br />
                        <span className="species-change__btn-subtitle">
                            (Atualiza APENAS Tipo e Habilidades. Mantém Atributos atuais)
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            // Brand New: Wipes skills/moves (wipeData=true), and applies new stats (updateStats=true)
                            applySpeciesData(pendingSpeciesData, true, true);
                            onClose();
                        }}
                        className="action-button action-button--red species-change__btn-new"
                    >
                        ⚠️ Pokémon Totalmente Novo
                        <br />
                        <span className="species-change__btn-subtitle">(Apaga Golpes e Perícias completamente)</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="action-button action-button--dark species-change__btn-cancel"
                    >
                        Cancelar Alteração
                    </button>
                </div>
            </div>
        </div>
    );
}
