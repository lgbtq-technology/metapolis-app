import React from 'react';
export default props => <button type={props.type} className={'dark' in props ? 'dark' : null}>
    {props.children}
    <style jsx>{`
        button {
            margin: 0;
            text-decoration: none;
            border: none;
            border-radius: 0.25em;
            padding: 1em;
        }

        .dark {
            background-color: #261C25;
            color: white;
        }
    `}</style>
</button>
