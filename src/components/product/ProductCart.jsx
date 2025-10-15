import { MinusIcon, PlusIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import styled from "styled-components";
import { formatCurrency } from "../../lib/formatters";
import React from 'react'

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    width: 100%;
    height: auto;
    box-shadow: var(--border-bottom);
    padding: 2.5%;
    transition: all .1s ease-in-out;
    
    &:hover {
        background-color: var(--color--white-2);
    }

    @media (max-width: 768px) {
        padding: 2.5%;
    }
`

const Remove = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    gap: 6px;
    border: none;
    cursor: pointer;
    padding: 6px;
    font-size: 14px;

    @media (max-width: 768px) {
        padding: 4px;
        font-size: 12px;    
    }

    &:hover {
        color: var(--color--primary);
    }

    & span {
        line-height: 100%;
    }
`

const Image = styled.div`
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-color: var(--color--gray-5);
    box-shadow: var(--border-full);

    @media (max-width: 768px) {
        width: 80px;
        height: 80px;
    }

    & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }
`

const Texts = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
    width: 70%;

    @media (max-width: 768px) {
        gap: 4px;    
    }

    & h2 {
        font-size: 20px;
        font-weight: 600;
        color: var(--color--black);
        line-height: 1.1;

        @media (max-width: 768px) {
            font-size: 12px;
        }
    }

    & p {
        font-size: 12px;
        font-weight: 400;
        color: var(--color--gray);
        margin: 0;

        @media (max-width: 768px) {
            font-size: 10px;
        }
    }

    & ul {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;

        & li {
            font-size: 14px;
            color: var(--color--gray);
            display: flex;
            align-items: center;
            justify-content: center;

            @media (max-width: 768px) {
                font-size: 12px;
            }
            
        }
    }
`

const Company = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;

    & img {
        width: 28px;
        height: 28px;
        object-fit: contain;
        border-radius: 42px;
        padding: 2px;
        box-shadow: var(--border-full);

        @media (max-width: 768px) {
            width: 20px;
            height: 20px;
        }
    }

    & span {
        font-size: 14px;
        color: var(--color--gray);
        font-weight: 400;

        @media (max-width: 768px) {
            font-size: 12px;
        }
    }
`

const Amount = styled.div`
    height: 100%;
    width: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    & button {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        box-shadow: var(--border-full);
        color: var(--color--black);
        padding: 6px;
        border: none;
        cursor: pointer;
        border-radius: 20px;    

        @media (max-width: 768px) {
            padding: 4px;

            & svg {
                font-size: 12px;
            }
        }
    }

    & input {
        cursor: default;
        color: var(--color--black-2);
        font-size: 14px;
        width: 30px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;

        @media (max-width: 768px) {
            font-size: 12px;
            width: 12px;
            height: 18px;
        }
    }
`

const Price = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex-direction: column;
    gap: 4px;
`

const All = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: center;

    & span {
        font-size: 18px;
        line-height: 100%;
        font-weight: 600;
        color: var(--color--green);

        @media (max-width: 768px) {
            font-size: 16px;    
        }
    }
`

const Un = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;

    & span {
        font-size: 12px;
        line-height: 100%;
        font-weight: 400;
        color: var(--color--gray);

        @media (max-width: 768px) {
            font-size: 10px;
        }
    }
` 

const Left = styled.div`
    width: 70%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 28px;
    height: 100%;

    @media (max-width: 768px) {
        gap: 12px;    
    }
`

const Right = styled.div`
    width: fit-content;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    height: 100%;
`

export default function ProductCart({
    image,
    slug,
    name,
    quantity = 1,
    price = 0,
    brandName,
    imageBrand,
    sku,
    onRemove = () => {},
    onUpdateQuantity = () => {}
}) {

    const [localQty, setLocalQty] = React.useState(quantity)

    React.useEffect(() => setLocalQty(quantity), [quantity])

    const changeQty = (next) => {
        const q = Math.max(1, Number(next) || 1)
        setLocalQty(q)
        onUpdateQuantity(q)
    }

    return (
        <>
            <Container>
                <Left>
                    <Image>
                        <img src={image} alt={slug} />
                    </Image>
                    <Texts>
                        <Company>
                            {imageBrand ? (
                                <img src={imageBrand} alt={brandName || 'Marca'} />
                            ) : (
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color--gray-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--color--gray)' }}>
                                    {(brandName || name || '').slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span>{brandName || '-'}</span>
                        </Company>
                        <h2>{name}</h2>
                        <p>SKU: {sku}</p>
                    </Texts>
                </Left>
                <Right>
                    <Remove onClick={onRemove}>
                        <span>Remover</span>
                        <XIcon />
                    </Remove>
                    <Amount>
                        <button onClick={() => changeQty(localQty - 1)}><MinusIcon weight="regular" /></button>
                        <input type="number" min={1} value={localQty} onChange={(e) => changeQty(e.target.value)} />
                        <button onClick={() => changeQty(localQty + 1)}><PlusIcon weight="regular"/></button>
                    </Amount>
                    <Price>
                        <All>
                            <span>{(Number(price) > 0) ? formatCurrency(price * localQty) : '-'}</span>
                        </All>
                        <Un>
                            <span>1x</span>
                            <span>{(Number(price) > 0) ? formatCurrency(price) : '-'}</span>
                        </Un>
                    </Price>
                </Right>
            </Container>
        </>
    )
}