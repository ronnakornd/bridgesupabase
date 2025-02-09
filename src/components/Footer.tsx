import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className='p-14' style={footerStyle}>
            <p>contact us at: contact@bridgethegapschool.com</p>
            <p className='font-opunbold'>&copy; {new Date().getFullYear()} Bridge the Gap School. All rights reserved.</p>
        </footer>
    );
};

const footerStyle: React.CSSProperties = {
    bottom: 0,
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
};

export default Footer;