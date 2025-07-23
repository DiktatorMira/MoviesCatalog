import { useState, useEffect } from 'react';
import Button from '../button/button.component';
import './window.component.scss'

export default function ModalWindow({ onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleBackgroundClick = (e) => { // Закриття по кліку на тлі
        if (e.target === e.currentTarget) handleClose();
    };
    const handleClose = () => {
        setIsClosing(true);
        // Даємо час 300 мс анімації виконатись перед закриттям
        setTimeout(() => { onClose(); }, 300);
    };
    const handleCancel = () => { handleClose(); };
    
    useEffect(() => { setIsClosing(false); }, []); // Скидаємо стан закриття під час монтування компонента
    useEffect(() => {
        const handleEsc = (e) => { // Закриття по ESC
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    return(
        <div 
            className={`window-background ${isClosing ? 'closing' : ''}`}
            onClick={handleBackgroundClick}
        >
            <section>
                <h1>Wait!</h1>
                <span>Are you sure you want to delete the movie?</span>
                <div className="for-button">
                    <Button type="button" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit">Yes!</Button>
                </div>
            </section>
        </div>
    )
}