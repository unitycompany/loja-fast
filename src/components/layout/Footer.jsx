import styled from "styled-components"

import ProductIcon from "../buttons/ProductIcon"
import { AtIcon, PhoneCallIcon, WhatsappLogoIcon, InstagramLogo, FacebookLogo } from "@phosphor-icons/react/dist/ssr"
import AlephsramosdevWidget from "../AlephsramosdevWidget"
import brandLogo from '../../assets/logotipo-fastsistemasconstrutivos-colours.svg'

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

const BrandPanel = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    max-width: 480px;

    @media (max-width: 768px) {
        width: 100%;
    }
`

const BrandLogoImage = styled.img`
    width: 56px;
    height: auto;
    object-fit: contain;
`

const BrandTagline = styled.p`
    margin: 0;
    font-size: 16px;
    font-weight: 400;
    color: var(--color--gray-6);
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`

const ContactsPanel = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 16px;

    & h2 {
        font-size: 20px;
        font-weight: 400;
        color: var(--color--gray-4);

        @media (max-width: 768px) {
            font-size: 18px;
        }
    }
`

const ContactBadges = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    list-style: none;
    padding: 0;
    margin: 0;

    @media (max-width: 768px) {
        width: 100%;
    }
`

const ContactBadge = styled.li`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 200ms ease, color 200ms ease;

    &:hover,
    &:focus-visible {
        background-color: rgba(255, 255, 255, 0.08);
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

        & .policy-actions {
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;

            & span {
                font-size: 11px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: var(--color--gray-4);
            }

            & a {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.18);
                color: #fff;
                font-weight: 600;
                text-decoration: none;
                transition: background 160ms ease, transform 160ms ease, box-shadow 160ms ease;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);

                &:hover,
                &:focus-visible {
                    background: rgba(255, 255, 255, 0.28);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
                }
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
    phone = '+55 (21) 99288-2282',
    instagramUrl = 'https://www.instagram.com/fastsistemasconstrutivo/',
    facebookUrl = 'https://www.facebook.com/fastsistemasconstrutivo',
    brandName = 'Fast Sistemas Construtivos',
    brandLogoSrc = brandLogo,
    brandSlogan = 'Light Steel Frame e Drywall • Soluções Acústicas e Casas Pré-Fabricadas',
    devName = 'aleph-desenvolvedor-web',
    devLogoUrl = 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/c1fad5b2-b982-4cdf-a56a-97a1e7ed6d00/public',
    devLink = ''
}) {
    const numericPhone = phone.replace(/\D/g, '')
    const whatsappLink = `https://wa.me/${numericPhone}`
    const telLink = `tel:+${numericPhone}`

    const contactItems = [
        {
            key: 'instagram',
            label: 'Instagram',
            action: () => window.open(instagramUrl, '_blank', 'noopener,noreferrer'),
            icon: <InstagramLogo weight="thin" />
        },
        {
            key: 'whatsapp',
            label: 'WhatsApp',
            action: () => window.open(whatsappLink, '_blank', 'noopener,noreferrer'),
            icon: <WhatsappLogoIcon weight="thin" />
        },
        {
            key: 'phone',
            label: 'Telefone',
            action: () => { window.location.href = telLink },
            icon: <PhoneCallIcon weight="thin" />
        },
        {
            key: 'email',
            label: 'Email',
            action: () => { window.location.href = `mailto:${mail}` },
            icon: <AtIcon weight="thin" />
        }
        // {
        //     key: 'facebook',
        //     label: 'Facebook',
        //     action: () => window.open(facebookUrl, '_blank', 'noopener,noreferrer'),
        //     icon: <FacebookLogo weight="thin" />
        // }
    ]

    return (
        <>
            <Container>
                <Infos>
                    <BrandPanel>
                        <BrandLogoImage src={brandLogoSrc} alt={`${brandName} logo`} loading="lazy" />
                        <BrandTagline>{brandSlogan}</BrandTagline>
                    </BrandPanel>
                    <ContactsPanel>
                        <h2>Contatos</h2>
                        <ContactBadges>
                            {contactItems.map((item) => (
                                <ContactBadge
                                    key={item.key}
                                    onClick={item.action}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') item.action()
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Abrir ${item.label}`}
                                >
                                    <ProductIcon
                                        children={item.icon}
                                        color="#ffffff"
                                    />
                                </ContactBadge>
                            ))}
                        </ContactBadges>
                    </ContactsPanel>
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
                            <div className="policy-actions">
                                <span>Políticas</span>
                                <a
                                    href="https://fastsistemasconstrutivos.com.br/politica-de-privacidade/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Política de Privacidade
                                </a>
                            </div>
                        </aside>
                    </Policy>      
                    <Dev>
                    </Dev>          
                </Infos>
            </Container>
        </>
    )
}