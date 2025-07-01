import React from 'react';

const Offline = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Ops! Você está offline.</h1>
      <p>Não foi possível carregar o conteúdo. Por favor, verifique sua conexão com a internet.</p>
      <p>Você ainda pode navegar pelas páginas que foram salvas no seu dispositivo.</p>
    </div>
  );
};

export default Offline;