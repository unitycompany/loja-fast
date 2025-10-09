import styled from "styled-components";

const Icon = styled.div`
    box-shadow: var(--border-left);
    height: 100%;
    width: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 18px;
    cursor: pointer;
    transition: background-color 160ms ease, transform 160ms ease;
    position: relative;

    &:hover {
        background-color: rgba(0,0,0,0.03);
        transform: translateY(-1px);
        & svg { fill: var(--color--primary); transform: scale(0.95); }
    }

    & svg {
        width: auto;
        height: 26px;
        fill: var(--color--black-3);
    transition: transform 160ms ease, fill 160ms ease;

        @media (max-width: 768px){
            height: 22px;
        }
    }

    & span {
        position: absolute;
        top: 35%;
        left: 30%;
        transform: translate(-50%, -50%);
        background-color: var(--color--primary);
        color: var(--color--white-2);
        font-size: 10px;
        padding: 4px;
        border-radius: 50px;
        width: auto;
        height: 14px;
        line-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`

export default function HeaderIcon({
    children,
    onClick,
    id,
    items = 0 
}) {

    if(items === 0) {
        return (
            <>
                <Icon onClick={onClick} id={id}>
                    {children}
                </Icon>
            </>
        )
    }

    return (
        <>
           <Icon onClick={onClick} id={id}>
                {children}
                <span>{items}</span>
            </Icon>
        </>
    )
}