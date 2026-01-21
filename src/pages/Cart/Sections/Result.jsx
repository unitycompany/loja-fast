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

const AlertSection = styled.div`
    width: 100%;
    padding: 0 2.5%;
`

const Alert = styled.div`
    width: 100%;
    padding: 14px 16px;
    background-color: #ffedd5;
    border: 1px solid #fdba74;
    border-radius: 12px;
    display: grid;
    grid-template-columns: 36px 1fr;
    align-items: start;
    gap: 12px;

    & p {
        margin: 0;
        font-size: 14px;
        line-height: 1.35;
        color: var(--color--black-3);

        & strong {
            font-weight: 600;
            text-decoration: none;
        }
    }

    & a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        color: #7c2d12;
        text-decoration: underline;
    }

    & svg {
        font-size: 30px;
        color: #b45309;
    }

    @media (max-width: 768px) {
        grid-template-columns: 28px 1fr;
    }
`

const AlertActions = styled.div`
    margin-top: 8px;
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
                <AlertSection>
                    <Alert>
                        <WarningIcon />
                        <div>
                            <p>
                                Os valores exibidos nesta página <strong><i>são apenas uma referência</i></strong> e podem variar conforme a <strong>praça</strong>, o <strong>frete</strong>, as <strong>taxas</strong> e as <strong>demais condições comerciais.</strong> <br />
                                Ao solicitar um orçamento, você confirma que <strong><i>não está realizando uma compra</i></strong>, e que o valor final será informado pela equipe de Vendas da FAST.
                            </p>
                            <AlertActions>
                                <a
                                    href="https://fastsistemasconstrutivos.com.br/politica-de-privacidade/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Política de Privacidade
                                </a>
                            </AlertActions>
                        </div>
                    </Alert>
                </AlertSection>
                <Button>
                    <button onClick={() => setQuoteOpen(true)}>Solicitar Orçamento</button>
                </Button>
                <QuoteForm open={quoteOpen} onClose={() => setQuoteOpen(false)} />
            </Container>
        </>
    )
}