import { useState } from 'react';
import Form from './components/form/form.component'
import ModalWindow from './components/window/window.component';
import Button from './components/button/button.component';
import './app.scss'

export default function App() {
    const [isModalWindowVisible, setIsModalWindowVisible] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formTitle, setFormTitle] = useState('');

    const openForm = (title) => {
        setFormTitle(title);
        setIsFormVisible(true);
    };
    const closeForm = () => { setIsFormVisible(false); };
    const openModalWindow = () => { setIsModalWindowVisible(true); };
    const closeModalWindow = () => { setIsModalWindowVisible(false); };

  return (
    <>
      <aside className="menu">
        <ul className='buttons'>
          <li onClick={() => openForm('Add film')}>Add film</li>
          <li onClick={() => openForm('Edit film')}>Edit film</li>
          <li onClick={() => openModalWindow()}>Delete film</li>
          <li>Import from file</li>
        </ul>
      </aside>
      <section className='left-section'>
        <header>
          <Button className="sort-button">Sort by alphabet</Button>
          <input type="text" name="movie-name" placeholder="Search movie by name"/>
          <input type="text" name="author-name" placeholder="Search movie by author name"/>
        </header>
        <ul className='movies-list'>
          <li>Some Info</li>
        </ul>
      </section>
      {isFormVisible && <Form title={formTitle} onClose={closeForm} />}
      {isModalWindowVisible && <ModalWindow onClose={closeModalWindow} />}
    </>
  )
}