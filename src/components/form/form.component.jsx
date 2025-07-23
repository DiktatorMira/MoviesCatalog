// form.component.jsx
import { useState, useEffect } from 'react';
import Button from '../button/button.component';
import './form.component.scss';

export default function Form({ title, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        year: '',
        format: '',
        author: ''
    });
    const [isValid, setIsValid] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid) {
            console.log('Form submitted:', formData);
            setFormData({ title: '', year: '', format: '', author: '' });
            handleClose();
        }
    };
    const handleCancel = () => {
        setFormData({ title: '', year: '', format: '', author: '' });
        handleClose();
    };
    const handleClose = () => {
        setIsClosing(true);
        // Даємо час 300 мс анімації виконатись перед закриттям
        setTimeout(() => { onClose(); }, 300);
    };
    const handleBackgroundClick = (e) => { // Закриття по кліку на тлі
        if (e.target === e.currentTarget) handleClose();
    };

    useEffect(() => { setIsClosing(false); }, []); // Скидаємо стан закриття під час монтування компонента
    useEffect(() => {
        const handleEsc = (e) => { // Закриття по ESC
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);
    useEffect(() => {
        const isFormValid = 
            formData.title.trim() !== '' &&
            formData.year.trim() !== '' &&
            formData.format !== '' &&
            formData.author.trim() !== '';
        setIsValid(isFormValid);
    }, [formData]);

    return (
        <div 
            className={`form-background ${isClosing ? 'closing' : ''}`}
            onClick={handleBackgroundClick}
        >
            <form onSubmit={handleSubmit}>
                <h2>{title}</h2>
                <input
                    type="text"
                    name="title"
                    placeholder="Movie title"
                    value={formData.title}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="year"
                    placeholder="Year of release"
                    value={formData.year}
                    onChange={handleInputChange}
                />
                <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                >
                    <option value="" disabled>Select format</option>
                    <option value="vhc">VHC</option>
                    <option value="dvd">DVD</option>
                    <option value="bluray">Blu-ray</option>
                </select>
                <input
                    type="text"
                    name="author"
                    placeholder="Author's name and surname"
                    value={formData.author}
                    onChange={handleInputChange}
                />
                <div className="for-button">
                    <Button type="button" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit" disabled={!isValid}>Apply</Button>
                </div>
            </form>
        </div>
    );
}