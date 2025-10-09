import styled from "styled-components";

const Container = styled.button`
    padding: 8px;
    border: 1px solid ${({ color }) => color ? `${color}10` : '#999999'};
    background-color: ${({ color }) => color ? `${color}20` : '#000000'};
    color: ${({ color }) => color || '#fff'};
    backdrop-filter: blur(4px);
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    z-index: 10;
    border-radius: 0;
    transition: transform 120ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease;

    @media (max-width: 768px) {
        width: 36px;
        height: 36px;        
    }

    &:hover { background-color: ${({ color }) => color ? `${color}30` : '#000000'}; border: 1px solid ${({ color }) => color ? `${color}40` : '#000000'}; box-shadow: 0 6px 12px rgba(0,0,0,0.06); }
    &:active { transform: scale(0.97); }
    &:focus-visible { outline: 2px solid ${({ color }) => color || '#0ea5e9'}; outline-offset: 2px; }

    @media (prefers-reduced-motion: reduce) {
        transition: none; &:active { transform: none; }
    }
`

export default function ProductIcon ({
    children,
    color,
    onClick,
    active = false,
    ariaLabel
}) {
    return (
        <>
            <Container
                color={color}
                onClick={onClick}
                $active={active}
                aria-pressed={active}
                aria-label={ariaLabel}
                type="button"
            >
                {children}
            </Container>
        </>
    )
}