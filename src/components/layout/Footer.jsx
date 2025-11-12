import styled from "styled-components"

import { useEffect, useState } from 'react'
import { fetchSecurity } from '../../services/securityService'
import { resolveImageUrl } from '../../services/supabase'
import ProductIcon from "../buttons/ProductIcon"
import { At, AtIcon, PhoneCallIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr"
import AlephsramosdevWidget from "../AlephsramosdevWidget"

const Container = styled.footer`
    width: 100%;
    max-width: 1440px;
    position: relative;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    padding: 2.5%;
    background-color: var(--color--black);

    @media (max-width: 768px) {
        padding: 5%;
        margin-top: 18px;
        gap: 28px;
    }
`

const Infos = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 26px;
    box-shadow: var(--border-bottom);

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
        padding-bottom: 28px;
    }

    &:last-child {
        box-shadow: none;
        padding-bottom: 0;
    }
`

const Item = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 18px;

    &:last-child {
        @media (max-width: 768px) {
            & ul {
                flex-direction: column;
                align-items: flex-start;
            }

            & li {
                padding-right: 0;
                box-shadow: none;
            }
        }
    }

    & h2 {
        font-size: 20px;
        font-weight: 400;
        color: var(--color--gray-4);

        @media (max-width: 768px) {
            font-size: 18px;
        }
    }

    & ul {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: row;
        width: 100%;
        gap: 12px;

        & li {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            gap: 6px;
            cursor: pointer;
            padding-right: 12px;
            box-shadow: var(--border-right);

            @media (max-width: 768px) {
                gap: 12px;
            }

            &:last-child {
                box-shadow: none;
                padding-right: 0;
            }

            & img {
                width: 100px;
                height: auto;
                object-fit: contain;
                object-position: center;
                cursor: default;
            }

            & span {
                font-size: 16px;
                font-weight: 400;
                color: var(--color--gray-6);

                @media (max-width: 768px) {
                    font-size: 14px;
                }
            }
        }
    }
`

const Policy = styled.div`
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
    height: auto;

    @media (max-width: 768px) {
        width: 100%;    
    }

    & h2 {
        font-size: 20px;
        font-weight: 400;
        color: var(--color--gray-4);
        line-height: 1.1;

        @media (max-width: 768px) {
            font-size: 16px;    
        }
    }

    & aside {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        gap: 0px;
        width: 100%;
        height: auto;

        @media (max-width: 768px) {
            gap: 4px;
        }

        & p {
            font-size: 14px;
            font-weight: 400;
            color: var(--color--gray-2);
            margin: 0;

            @media (max-width: 768px) {
                font-size: 12px;
            }
        }
    }
`

const Dev = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;

    & span {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: 400;
        color: var(--color--white-2);

        & img {
            width: 20px;
            height: 20px;
            filter: invert(1) brightness(2);
        }
    }
`

export default function Footer({
    mail = 'atendimento@fastsistemasconstrutivos.com.br',
    phone = '+55 (21) 999288-2282',
    devName = 'aleph-desenvolvedor-web',
    devLogoUrl = 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/c1fad5b2-b982-4cdf-a56a-97a1e7ed6d00/public',
    devLink = ''
}) {
    const [security, setSecurity] = useState([])

    useEffect(() => {
        let mounted = true
        fetchSecurity().then(s => { if (mounted) setSecurity(s) }).catch(console.error)
        return () => { mounted = false }
    }, [])
    const [imageMap, setImageMap] = useState({})

    useEffect(() => {
        let mounted = true
        async function load() {
            const map = {}
            await Promise.all((security || []).map(async (s, idx) => {
                try {
                    map[idx] = await resolveImageUrl(s.image)
                } catch (e) {
                    map[idx] = s.image
                }
            }))
            if (mounted) setImageMap(map)
        }
        if ((security || []).length) load()
        return () => { mounted = false }
    }, [security])

    return (
        <>
            <Container>
                <Infos>
                    <Item>
                        <h2>Segurança</h2>
                        <ul>
                            {
                                (security || []).map((s, index) => (
                                    <li key={index}>
                                        <img src={imageMap[index] || s.image} alt={s.name} />
                                    </li>
                                ))
                            }
                        </ul>
                    </Item>
                    <Item>
                        <h2>Fale com o time de Televendas</h2>
                        <ul>
                            <li onClick={() => window.location.href = `https://wa.me/${phone.replace(/\D/g, '')}`}>
                                <ProductIcon 
                                    children={<PhoneCallIcon weight="thin"/>}
                                    color="#ffffff"
                                />
                                <ProductIcon 
                                    children={<WhatsappLogoIcon weight="thin"/>}
                                    color="#ffffff"
                                />
                                <span>{phone}</span>
                            </li>
                            <li onClick={() => window.location.href = `mailto:${mail}`}>
                                <ProductIcon 
                                    children={<AtIcon weight="thin"/>}
                                    color="#ffffff"
                                />
                                <span>{mail}</span>
                            </li>
                        </ul>
                    </Item>
                </Infos>
                <Infos>
                    <Policy>
                        <h2>
                            Fast Sistemas Construtivos | Light Steel Frame e Drywall <br/>
                            Soluções Acústicas e Casas Pré-Fabricadas
                        </h2>
                        <aside>
                            <p>Fast Drywall Franchising Ltda | CNPJ 40.436.034/0001-48</p>
                            <p>R. Equador, 43 - Bl 3 Sala 720 - Santo Cristo - Rio de Janeiro - RJ - CEP 20220-410</p>
                        </aside>
                    </Policy>      
                    <Dev>
                        <AlephsramosdevWidget />
                    </Dev>          
                </Infos>
            </Container>
        </>
    )
}