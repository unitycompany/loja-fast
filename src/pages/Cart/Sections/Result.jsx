import styled from "styled-components";
import { formatCurrency } from "../../../lib/formatters";
import { WarningDiamondIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import React from 'react'
import { useCart } from '../../../contexts/CardContext'
import QuoteForm from '../../../components/cart/QuoteForm'

const Container = styled.div`
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    flex-direction: column;
`

const Title = styled.div`
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
    box-shadow: var(--border-bottom);
    padding: 2.5%;
    background-color: var(--color--white-2);

    @media (max-width: 768px) {
        padding: 2.5%;    
    }

    & h2 {
        font-size: clamp(1.1rem, 0.95rem + 1vw, 1.5rem);
        font-weight: 400;
        color: var(--color--black-2);
    }
`

const Resume = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0% 2.5%;
    gap: 20px;

    @media (max-width: 768px) {
        padding: 0% 2.5%;    
    }

    & div {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:nth-child(1) {
            padding-bottom: 8px;
            box-shadow: var(--border-bottom);
        }

        & p {
            margin: 0;
            font-size: 16px;
            font-weight: 400;
            color: var(--color--black-4);
        }

        & span {
            font-size: 18px;

            & b {
                font-weight: 400;
                color: var(--color--black-4);
                font-size: 14px;
            }
        }
    }

`

const Alert = styled.div`
    width: 100%;
    padding: 12px 2.5%;
    background-color: #FFA500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    @media (max-width: 768px) {
        padding: 12px 2.5%;    
    }

    & p {
        margin: 0;
        font-size: 14px;
        line-height: 1.2;
    }

    & svg {
        font-size: 40px;

        @media (max-width: 768px) {
            font-size: 62px;    
        }
    }
`

const Button = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 2.5% 0 0 0;
    position: relative;

    & button {
        width: 100%;
        height: 100%;
        background-color: var(--color--green);
        color: var(--color--white);
        font-weight: 500;
        text-transform: uppercase;
        font-size: 16px;
        padding: 18px;
        border: none;
        border-radius: 0;
    }
`

export default function Result({
    totalPrice,
    totalProducts = 0
}) {
    useCart() // keep hook in case of future extensions (no direct usage here)
    const [quoteOpen, setQuoteOpen] = React.useState(false)
    return (
        <>
            <Container>
                <Title>
                    <h2>Resumo do orçamento</h2>
                </Title>
                <Resume>
                    <div>
                        <p>Total de produtos</p>
                        <span>{totalProducts}</span>
                    </div>
                    <div>
                        <p>Subtotal</p>
                        <span><b>a partir de</b> {formatCurrency(totalPrice)}</span>
                    </div>
                </Resume>
                <Button>
                    <Alert>
                        <WarningIcon />
                        <p>Você está solicitando um orçamento, o valor pode variar dependendo da praça, taxas, frete etc. Ao solicitar um orçamento você confirma que entendeu isso.</p>
                    </Alert>
                    <button onClick={() => setQuoteOpen(true)}>Solicitar Orçamento</button>
                </Button>
                <QuoteForm open={quoteOpen} onClose={() => setQuoteOpen(false)} />
            </Container>
        </>
    )
}